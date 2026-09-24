import React, { useState, useRef } from 'react';
import { 
  Users, UserPlus, Shield, ShieldCheck, Camera, Upload, Trash2, 
  CheckCircle2, AlertTriangle, Lock, Eye, Calendar, Sparkles, X, Plus, LockKeyhole
} from 'lucide-react';
import { User, FamilyMember, FamilyRelationship } from '../types';
import { store } from '../services/store';
import { WebcamCapture } from './WebcamCapture';
import { 
  formatAadhaarNumber, cleanAadhaarNumber, validateOfficialAadhaar, lookupOfficialAadhaar, 
  calculateAgeFromDob, getDobFromAge, OfficialCitizen, getAllOfficialCitizens
} from '../services/aadhaarUtils';
import { createSyntheticFaceDataUrl } from '../services/faceAnalysis';
import { UnifiedFaceModal } from './UnifiedFaceModal';

interface FamilyManagerProps {
  currentUser: User;
  onUpdateUser: () => void;
  onLogout?: () => void;
}

interface FaceEditTarget {
  id: string;
  name: string;
  relationship?: string;
  isPrimary: boolean;
  currentPhotoUrl: string;
  aadhaarNumber?: string;
}

export const FamilyManager: React.FC<FamilyManagerProps> = ({
  currentUser,
  onUpdateUser,
  onLogout,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add Member Form state
  const [memberName, setMemberName] = useState('');
  const [relationship, setRelationship] = useState<FamilyRelationship>('Brother');
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [dob, setDob] = useState(getDobFromAge(24));
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [showWebcam, setShowWebcam] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAgeFixedByAadhaar, setIsAgeFixedByAadhaar] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  // Dedicated Face Management state for specific profiles
  const [showUnifiedFaceModal, setShowUnifiedFaceModal] = useState(false);
  const [faceModalTargetId, setFaceModalTargetId] = useState<string>(currentUser.id);
  const [faceModalTarget, setFaceModalTarget] = useState<FaceEditTarget | null>(null);
  const [faceModalPhoto, setFaceModalPhoto] = useState<string>('');
  const [faceModalWebcamActive, setFaceModalWebcamActive] = useState(false);
  const faceModalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Dedicated Profile Deletion state
  const [memberToDelete, setMemberToDelete] = useState<{
    id: string;
    name: string;
    relationship: string;
    aadhaarNumber: string;
    age: number;
  } | null>(null);
  const [showDeletePrimaryModal, setShowDeletePrimaryModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const calculatedAge = calculateAgeFromDob(dob);
  const familyList = currentUser.familyMembers || [];

  const handleOpenAddModal = (initialAadhaar?: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsDuplicate(false);

    if (initialAadhaar) {
      handleAadhaarChange(initialAadhaar);
    } else {
      setAadhaarInput('');
      setMemberName('');
      setDob(getDobFromAge(24));
      setGender('Male');
      setPhotoUrl('');
      setIsAgeFixedByAadhaar(false);
    }
    setShowAddModal(true);
  };

  // Auto-fixes Name, Age, DOB, and Gender immediately upon typing 12-digit Aadhaar number
  // Also checks for duplicate Aadhaar against household members
  const handleAadhaarChange = (val: string) => {
    const formatted = formatAadhaarNumber(val);
    setAadhaarInput(formatted);
    const clean = cleanAadhaarNumber(formatted);

    if (clean.length === 12) {
      // 1. Check if already linked in this household (duplicate check)
      const isAlreadyUsed = store.isAadhaarNumberUsed(formatted);
      if (isAlreadyUsed) {
        setIsDuplicate(true);
        setIsAgeFixedByAadhaar(false);
        const dupMember = familyList.find(f => cleanAadhaarNumber(f.aadhaarNumber) === clean) ||
          (cleanAadhaarNumber(currentUser.aadhaarNumber || '') === clean ? currentUser : null);
        const dupName = dupMember ? `"${dupMember.name}"` : 'an existing household account';
        setErrorMessage(`❌ DUPLICATE AADHAAR DETECTED: UID "${formatted}" is already linked to ${dupName} in this household! Each individual must have a unique Aadhaar.`);
        setSuccessMessage(null);
        return;
      }

      // 2. New Aadhaar - Auto-fix Name, Age, Gender, and Face Photo
      setIsDuplicate(false);
      const citizen = lookupOfficialAadhaar(formatted);
      if (citizen) {
        setMemberName(citizen.name);
        setDob(citizen.dob);
        setGender(citizen.gender);
        setRelationship(citizen.name.toLowerCase().includes('rithik') ? 'Son' : (citizen.gender === 'Female' ? 'Sister' : 'Brother'));
        setPhotoUrl(createSyntheticFaceDataUrl(citizen.name));
        setIsAgeFixedByAadhaar(true);
        setErrorMessage(null);
        setSuccessMessage(`✓ Aadhaar Recognized: ${citizen.name} • Fixed Age: ${citizen.age} Yrs (${citizen.age >= 18 ? 'Adult 18+' : 'Minor Under-18'}) • Gender: ${citizen.gender} — AUTO-FIXED & LOCKED`);
      }
    } else {
      setIsDuplicate(false);
      if (clean.length < 12) {
        setErrorMessage(null);
        setSuccessMessage(null);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const res = ev.target?.result as string;
        if (res) {
          setPhotoUrl(res);
          setSuccessMessage('Face picture uploaded successfully!');
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!memberName.trim()) {
      setErrorMessage('Please enter the family member\'s full name.');
      return;
    }

    // Official UIDAI registry check & name verification
    const officialCheck = validateOfficialAadhaar(aadhaarInput, memberName);
    if (!officialCheck.valid) {
      setErrorMessage(officialCheck.message);
      return;
    }

    // Duplicate Aadhaar Number Verification
    const isDuplicate = store.isAadhaarNumberUsed(aadhaarInput);
    if (isDuplicate) {
      setErrorMessage(`Duplicate Aadhaar Alert: Aadhaar number "${aadhaarInput}" is already registered in the system! Each individual must have a distinct Aadhaar.`);
      return;
    }

    if (!photoUrl) {
      setErrorMessage('Please take a facial snapshot or upload a photo for Aadhaar biometric face registration.');
      return;
    }

    const res = store.addFamilyMember({
      name: memberName.trim(),
      relationship,
      aadhaarNumber: formatAadhaarNumber(aadhaarInput),
      age: calculatedAge,
      dob,
      gender,
      photoUrl,
    });

    if (res.success) {
      setShowAddModal(false);
      onUpdateUser();
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleOpenFaceModal = (target: FaceEditTarget) => {
    setFaceModalTargetId(target.id);
    setShowUnifiedFaceModal(true);
  };

  const handleFaceModalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const res = ev.target?.result as string;
        if (res) {
          setFaceModalPhoto(res);
          setFaceModalWebcamActive(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveFaceModal = () => {
    if (!faceModalTarget || !faceModalPhoto) return;

    if (faceModalTarget.isPrimary) {
      store.updateUserPhoto(faceModalPhoto);
    } else {
      store.updateFamilyMemberPhoto(faceModalTarget.id, faceModalPhoto);
    }

    setSuccessMessage(`✓ Biometric face template updated successfully for ${faceModalTarget.name}!`);
    setTimeout(() => setSuccessMessage(null), 3500);
    setFaceModalTarget(null);
    onUpdateUser();
  };

  const handleConfirmDeleteMember = () => {
    if (!memberToDelete) return;
    const deletedName = memberToDelete.name;
    store.deleteFamilyMember(memberToDelete.id);
    setMemberToDelete(null);
    onUpdateUser();
    setSuccessMessage(`Profile for "${deletedName}" was successfully deleted from household.`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleConfirmDeletePrimary = () => {
    store.deleteCurrentUser();
    setShowDeletePrimaryModal(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-center gap-2 text-emerald-300 text-xs font-mono animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-black text-white">Household Aadhaar & Biometric Registry</h2>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Manage enrolled household members. Typing an authorized Aadhaar number locks their verified name & age automatically.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setFaceModalTargetId(currentUser.id);
              setShowUnifiedFaceModal(true);
            }}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4 text-red-500" />
            <span>Add / Update Face</span>
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/40 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Family Member</span>
          </button>
        </div>
      </div>

      {/* Family Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Primary Account Holder Card */}
        <div className="bg-zinc-900 border-2 border-red-500/50 rounded-3xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase rounded-full font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-red-500" />
              Primary Account Holder
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">UIDAI Verified</span>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={currentUser.webcamPhotoUrl || createSyntheticFaceDataUrl(currentUser.name)}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-red-500/80 shadow-md bg-zinc-950 shrink-0"
            />
            <div className="space-y-1">
              <h3 className="font-black text-sm text-white line-clamp-1">{currentUser.name}</h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                Aadhaar: <span className="text-zinc-200">{currentUser.aadhaarNumber || '2841 9382 7105'}</span>
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-zinc-800">
            <div className="p-1.5 bg-zinc-950 rounded-lg text-zinc-400">
              Age: <strong className="text-white">{currentUser.age} Yrs (FIXED)</strong>
            </div>
            <div className={`p-1.5 bg-zinc-950 rounded-lg font-bold ${
              currentUser.age >= 18 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {currentUser.age >= 18 ? '✓ Adult 18+ Allowed' : '⛔ Under 18 Minor'}
            </div>
          </div>

          {/* Primary Profile Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => handleOpenFaceModal({
                id: currentUser.id,
                name: currentUser.name,
                isPrimary: true,
                currentPhotoUrl: currentUser.webcamPhotoUrl || '',
                aadhaarNumber: currentUser.aadhaarNumber,
              })}
              className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-zinc-700 hover:border-red-500/50 transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-red-500" />
              <span>Add / Update Face</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDeletePrimaryModal(true)}
              className="px-3 py-2 bg-zinc-800/80 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 text-xs font-bold rounded-xl border border-zinc-700 hover:border-red-500/40 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="Delete Primary Profile"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Registered Family Members */}
        {familyList.map((member) => (
          <div
            key={member.id}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase rounded-full font-mono">
                {member.relationship}
              </span>
              <button
                onClick={() => setMemberToDelete({
                  id: member.id,
                  name: member.name,
                  relationship: member.relationship,
                  aadhaarNumber: member.aadhaarNumber,
                  age: member.age,
                })}
                className="p-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                title="Remove Member"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={member.photoUrl}
                alt={member.name}
                className="w-16 h-16 rounded-2xl object-cover border border-zinc-700 shadow-md bg-zinc-950 shrink-0"
              />
              <div className="space-y-1">
                <h3 className="font-black text-sm text-white line-clamp-1">{member.name}</h3>
                <p className="text-[10px] text-zinc-400 font-mono">
                  Aadhaar: <span className="text-zinc-200">{member.aadhaarNumber}</span>
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                  <span className="text-zinc-400">Gender: {member.gender || 'Male'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-zinc-800">
              <div className="p-1.5 bg-zinc-950 rounded-lg text-zinc-400">
                Age: <strong className="text-white">{member.age} Yrs (FIXED)</strong>
              </div>
              <div className={`p-1.5 bg-zinc-950 rounded-lg font-bold ${
                member.age >= 18 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {member.age >= 18 ? '✓ All Movies (18+)' : '⛔ Restricted (Under 18)'}
              </div>
            </div>

            {/* Family Member Profile Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => handleOpenFaceModal({
                  id: member.id,
                  name: member.name,
                  relationship: member.relationship,
                  isPrimary: false,
                  currentPhotoUrl: member.photoUrl,
                  aadhaarNumber: member.aadhaarNumber,
                })}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-zinc-700 hover:border-red-500/50 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-red-500" />
                <span>Add / Update Face</span>
              </button>
              <button
                type="button"
                onClick={() => setMemberToDelete({
                  id: member.id,
                  name: member.name,
                  relationship: member.relationship,
                  aadhaarNumber: member.aadhaarNumber,
                  age: member.age,
                })}
                className="px-3 py-2 bg-zinc-800/80 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 text-xs font-bold rounded-xl border border-zinc-700 hover:border-red-500/40 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Delete Member Profile"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}

        {familyList.length === 0 && (
          <div className="col-span-full bg-zinc-900/40 border border-dashed border-zinc-800 rounded-3xl p-8 text-center text-zinc-400 text-xs space-y-2">
            <Users className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="font-bold text-zinc-300">No additional family members registered yet.</p>
            <p className="text-zinc-500">Click "Add Family Member" above to register household citizens with their authorized Aadhaar UIDs.</p>
          </div>
        )}

      </div>

      {/* Add Family Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl my-8">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white font-mono">Register Authorized Household Member</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Explanation & Teacher Demo Quick-Fill Buttons */}
            <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Quick Test Demo (1-Click for Teacher)
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Type 12 digits or click below
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleAadhaarChange('5329 1847 9021')}
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/40 hover:border-emerald-500/70 rounded-xl text-left transition-colors cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Adult Access 1
                  </div>
                  <div className="text-xs font-mono text-zinc-100 font-bold">5329 1847 9021</div>
                  <div className="text-[10px] text-zinc-400">Karthik Raja • 26 Yrs (18+)</div>
                  <div className="text-[9px] text-emerald-400 font-bold">✓ Full Access</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAadhaarChange('7418 2930 6514')}
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/40 hover:border-emerald-500/70 rounded-xl text-left transition-colors cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Adult Access 2
                  </div>
                  <div className="text-xs font-mono text-zinc-100 font-bold">7418 2930 6514</div>
                  <div className="text-[10px] text-zinc-400">Dhivya • 21 Yrs (18+)</div>
                  <div className="text-[9px] text-emerald-400 font-bold">✓ Full Access</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAadhaarChange('3192 8475 6012')}
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 hover:border-amber-500/70 rounded-xl text-left transition-colors cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Minor (&lt;18)
                  </div>
                  <div className="text-xs font-mono text-zinc-100 font-bold">3192 8475 6012</div>
                  <div className="text-[10px] text-zinc-400">Ananya • 14 Yrs (&lt;18)</div>
                  <div className="text-[9px] text-amber-400 font-bold">⛔ Blocked from 18+</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAadhaarChange('6712 4589 3012')}
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-red-500/40 hover:border-red-500/80 rounded-xl text-left transition-colors cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Test Duplicate
                  </div>
                  <div className="text-xs font-mono text-zinc-100 font-bold">6712 4589 3012</div>
                  <div className="text-[10px] text-zinc-400">Sangeshwaran (Linked)</div>
                  <div className="text-[9px] text-red-400 font-bold">❌ Blocked</div>
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-red-950/90 border border-red-500/60 rounded-xl text-xs text-red-300 font-mono flex items-start gap-2 shadow-lg">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-xs text-emerald-300 font-mono flex items-start gap-2 shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4">
              
              {/* PRIMARY: 12-Digit Aadhaar Number with Verification */}
              <div className="bg-zinc-950 border-2 border-red-500/50 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-zinc-200 font-bold flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                    12-Digit Aadhaar Number (Type Here)
                  </label>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                    Auto-Fixes Age & Name
                  </span>
                </div>
                
                <input
                  type="text"
                  value={aadhaarInput}
                  onChange={(e) => handleAadhaarChange(e.target.value)}
                  placeholder="e.g. 5329 1847 9021"
                  maxLength={14}
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-base text-white font-mono tracking-widest focus:border-red-500 outline-none"
                />
                <p className="text-[10px] text-zinc-400 font-mono">
                  • Only type the 12-digit Aadhaar number. Name, Age, and Gender are fixed and locked automatically.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-zinc-400">Full Name</label>
                  {isAgeFixedByAadhaar && (
                    <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                      <LockKeyhole className="w-3 h-3" /> Auto-Fixed by Aadhaar UID
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="Will auto-fill when Aadhaar number is typed"
                  required
                  readOnly={isAgeFixedByAadhaar}
                  className={`w-full px-3.5 py-2 rounded-xl text-sm outline-none border ${
                    isAgeFixedByAadhaar 
                      ? 'bg-zinc-950/60 border-zinc-800 text-zinc-200 cursor-not-allowed' 
                      : 'bg-zinc-950 border-zinc-800 text-white focus:border-red-500'
                  }`}
                />
              </div>

              {/* Relationship & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as FamilyRelationship)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:border-red-500 outline-none"
                  >
                    <option value="Brother">Brother</option>
                    <option value="Son">Son</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Sister">Sister</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono text-zinc-400">Gender</label>
                    {isAgeFixedByAadhaar && (
                      <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5">
                        <LockKeyhole className="w-2.5 h-2.5" /> Auto-Fixed
                      </span>
                    )}
                  </div>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    disabled={isAgeFixedByAadhaar}
                    className={`w-full px-3.5 py-2 rounded-xl text-sm outline-none border ${
                      isAgeFixedByAadhaar 
                        ? 'bg-zinc-950/60 border-zinc-800 text-zinc-300 cursor-not-allowed' 
                        : 'bg-zinc-950 border-zinc-800 text-white focus:border-red-500'
                    }`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Date of Birth & Calculated Verified Age */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono text-zinc-400">Date of Birth</label>
                    {isAgeFixedByAadhaar && (
                      <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5">
                        <LockKeyhole className="w-2.5 h-2.5" /> Auto-Fixed
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    readOnly={isAgeFixedByAadhaar}
                    className={`w-full px-3.5 py-2 rounded-xl text-sm font-mono outline-none border ${
                      isAgeFixedByAadhaar 
                        ? 'bg-zinc-950/60 border-zinc-800 text-zinc-300 cursor-not-allowed' 
                        : 'bg-zinc-950 border-zinc-800 text-white focus:border-red-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Aadhaar Verified Age</label>
                  <div className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-black font-mono text-red-400 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <LockKeyhole className="w-3.5 h-3.5" />
                      {calculatedAge} Yrs (FIXED)
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      calculatedAge >= 18 ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-red-950 text-red-400 border border-red-500/40'
                    }`}>
                      {calculatedAge >= 18 ? '18+ Adult (All Movies)' : 'Minor (Under 18 Restricted)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Facial Biometric Photo Capture for Aadhaar */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="block text-xs font-mono text-zinc-300 font-bold">
                  Aadhaar Biometric Face Registration
                </label>

                <div className="flex items-center gap-3">
                  <img
                    src={photoUrl || createSyntheticFaceDataUrl('placeholder')}
                    alt="Aadhaar Face"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-red-500/80 bg-zinc-950 shrink-0"
                  />
                  <div className="flex-1 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setShowWebcam(true)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Capture Webcam
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Photo / Picture
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Webcam Capture sub-modal */}
              {showWebcam && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
                  <WebcamCapture
                    onCapture={(capturedUrl) => {
                      setPhotoUrl(capturedUrl);
                      setShowWebcam(false);
                      setSuccessMessage('Webcam facial snapshot saved!');
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebcam(false)}
                    className="w-full py-1.5 bg-zinc-800 text-zinc-300 text-xs rounded-xl cursor-pointer"
                  >
                    Cancel Webcam
                  </button>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDuplicate || cleanAadhaarNumber(aadhaarInput).length !== 12}
                  className={`flex-1 py-2.5 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all ${
                    isDuplicate || cleanAadhaarNumber(aadhaarInput).length !== 12
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/60'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50 cursor-pointer'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isDuplicate 
                    ? 'Duplicate Aadhaar Blocked' 
                    : cleanAadhaarNumber(aadhaarInput).length !== 12 
                      ? `Type 12-Digit Aadhaar (${cleanAadhaarNumber(aadhaarInput).length}/12)` 
                      : 'Save Family Member'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Unified Biometric Face Registry (Single Hub for Household Faces) */}
      {/* ========================================================================= */}
      <UnifiedFaceModal
        isOpen={showUnifiedFaceModal}
        onClose={() => setShowUnifiedFaceModal(false)}
        currentUser={currentUser}
        initialTargetId={faceModalTargetId}
        onSaved={(personName) => {
          setSuccessMessage(`✓ Biometric face template saved for ${personName}!`);
          setTimeout(() => setSuccessMessage(null), 3500);
          onUpdateUser();
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL 2: Delete Family Member Profile Confirmation Modal */}
      {/* ========================================================================= */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-fadeIn">
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Delete Member Profile
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Permanent removal from household registry
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Name:</span>
                <span className="text-white font-bold">{memberToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Relationship:</span>
                <span className="text-zinc-200">{memberToDelete.relationship}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Age:</span>
                <span className="text-zinc-200">{memberToDelete.age} Years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Aadhaar UID:</span>
                <span className="text-red-400 font-bold">{memberToDelete.aadhaarNumber}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to delete the profile for <strong className="text-white">{memberToDelete.name}</strong>? 
              This will permanently remove their registered biometric face template and OTT movie streaming privileges.
            </p>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteMember}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/50 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Delete Primary Profile Confirmation Modal */}
      {/* ========================================================================= */}
      {showDeletePrimaryModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-fadeIn">
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Delete Primary Account & Profile
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Permanent profile erasure
                </p>
              </div>
            </div>

            <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-2xl space-y-2 text-xs">
              <p className="text-red-300 font-medium">
                Warning: Deleting your primary profile (<strong className="text-white">{currentUser.name}</strong>) will permanently erase your user account, login credentials, and all {familyList.length} household family profiles and face biometric templates from this system.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowDeletePrimaryModal(false)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeletePrimary}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/50 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Permanently Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
