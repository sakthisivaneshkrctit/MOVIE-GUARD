import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Upload, CheckCircle2, AlertTriangle, 
  X, Check, Sparkles, Shield, User as UserIcon, Users, LockKeyhole
} from 'lucide-react';
import { User, FamilyMember } from '../types';
import { store } from '../services/store';
import { WebcamCapture } from './WebcamCapture';
import { createSyntheticFaceDataUrl } from '../services/faceAnalysis';

interface UnifiedFaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  initialTargetId?: string;
  onSaved?: (personName: string) => void;
}

interface HouseholdPerson {
  id: string;
  name: string;
  relationship: string;
  isPrimary: boolean;
  age: number;
  aadhaarNumber: string;
  photoUrl: string;
}

export const UnifiedFaceModal: React.FC<UnifiedFaceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialTargetId,
  onSaved,
}) => {
  // Assemble complete household list
  const getHouseholdList = (): HouseholdPerson[] => [
    {
      id: currentUser.id,
      name: currentUser.name,
      relationship: 'Primary Account Owner',
      isPrimary: true,
      age: currentUser.age,
      aadhaarNumber: currentUser.aadhaarNumber || '2841 9382 7105',
      photoUrl: currentUser.webcamPhotoUrl,
    },
    ...(currentUser.familyMembers || []).map((fm) => ({
      id: fm.id,
      name: fm.name,
      relationship: fm.relationship,
      isPrimary: false,
      age: fm.age,
      aadhaarNumber: fm.aadhaarNumber,
      photoUrl: fm.photoUrl,
    })),
  ];

  const [household, setHousehold] = useState<HouseholdPerson[]>(getHouseholdList());
  const [selectedId, setSelectedId] = useState<string>(initialTargetId || currentUser.id);
  const [stagedPhoto, setStagedPhoto] = useState<string>('');
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync household when currentUser changes or modal opens
  useEffect(() => {
    const list = getHouseholdList();
    setHousehold(list);
    const target = (initialTargetId && list.find((p) => p.id === initialTargetId)) || list[0];
    if (target) {
      setSelectedId(target.id);
      setStagedPhoto(target.photoUrl);
    }
    setIsWebcamActive(false);
  }, [currentUser, initialTargetId, isOpen]);

  if (!isOpen) return null;

  const currentPerson = household.find((p) => p.id === selectedId) || household[0];

  const handleSelectPerson = (person: HouseholdPerson) => {
    setSelectedId(person.id);
    setStagedPhoto(person.photoUrl);
    setIsWebcamActive(false);
    setSuccessToast(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          setStagedPhoto(result);
          setIsWebcamActive(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveFace = () => {
    if (!currentPerson || !stagedPhoto) return;

    if (currentPerson.isPrimary) {
      store.updateUserPhoto(stagedPhoto);
    } else {
      store.updateFamilyMemberPhoto(currentPerson.id, stagedPhoto);
    }

    // Update local state so UI updates immediately
    setHousehold((prev) =>
      prev.map((p) => (p.id === currentPerson.id ? { ...p, photoUrl: stagedPhoto } : p))
    );

    const msg = `Face template saved for ${currentPerson.name}!`;
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);

    if (onSaved) {
      onSaved(currentPerson.name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-7 max-w-xl w-full space-y-5 shadow-2xl my-auto animate-fadeIn">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600/15 border border-red-500/30 rounded-xl text-red-500 shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Biometric Face Registry
                <span className="px-2 py-0.5 bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold rounded-full">
                  Single Hub
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Only one face is saved per person for secure Aadhaar verification
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-xs text-emerald-300 font-mono flex items-center gap-2 shadow-lg animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Person Selector Tabs: Only one place to switch between all household members */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1 font-bold text-zinc-300">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Select Person ({household.length} Registered):
            </span>
            <span className="text-[10px] text-emerald-400">
              Click to manage &amp; save face
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {household.map((person) => {
              const isSelected = person.id === selectedId;
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => handleSelectPerson(person)}
                  className={`px-3 py-2 rounded-2xl text-xs font-mono flex items-center gap-2 shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-red-600 text-white font-bold border-red-500 shadow-lg shadow-red-950/50 scale-[1.02]'
                      : 'bg-zinc-950 hover:bg-zinc-800/90 text-zinc-300 border-zinc-800'
                  }`}
                >
                  <img
                    src={person.photoUrl || createSyntheticFaceDataUrl(person.name)}
                    alt={person.name}
                    className="w-6 h-6 rounded-full object-cover border border-white/20 bg-zinc-900"
                  />
                  <div className="text-left leading-tight">
                    <p className="truncate max-w-[110px]">{person.name}</p>
                    <p className={`text-[9px] ${isSelected ? 'text-red-100' : 'text-zinc-500'}`}>
                      {person.isPrimary ? 'You' : person.relationship} • {person.age}y
                    </p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 ml-0.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Person Card Info */}
        <div className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Selected Profile:</span>
            <strong className="text-white">{currentPerson.name}</strong>
            <span className="text-zinc-500">({currentPerson.relationship})</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-zinc-400">UID: <span className="text-amber-400 font-bold">{currentPerson.aadhaarNumber}</span></span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              currentPerson.age >= 18 
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' 
                : 'bg-red-950 text-red-400 border border-red-500/40'
            }`}>
              {currentPerson.age >= 18 ? 'Age 18+ (Adult)' : `Age ${currentPerson.age} (Minor <18)`}
            </span>
          </div>
        </div>

        {/* Face Capture & Preview Area */}
        {!isWebcamActive ? (
          <div className="p-4 sm:p-5 bg-zinc-950 border border-zinc-800 rounded-3xl flex flex-col items-center justify-center space-y-3 relative">
            <div className="relative">
              <img
                src={stagedPhoto || currentPerson.photoUrl || createSyntheticFaceDataUrl(currentPerson.name)}
                alt={currentPerson.name}
                className="w-36 h-36 rounded-2xl object-cover border-2 border-red-500/80 shadow-2xl bg-zinc-900"
              />
              <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-500 text-white rounded-full shadow-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-zinc-200">
                {stagedPhoto !== currentPerson.photoUrl
                  ? '✓ Staged new biometric face snapshot'
                  : '✓ Current biometric face template saved'}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                Only one front-facing portrait is required per individual for movie verification
              </p>
            </div>

            {/* Webcam / File triggers */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 w-full">
              <button
                type="button"
                onClick={() => setIsWebcamActive(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                Capture with Webcam
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                Upload Photo File
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        ) : (
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-3xl space-y-3">
            <WebcamCapture
              onCapture={(capturedUrl) => {
                setStagedPhoto(capturedUrl);
                setIsWebcamActive(false);
              }}
            />
            <button
              type="button"
              onClick={() => setIsWebcamActive(false)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Cancel Camera
            </button>
          </div>
        )}

        {/* Modal Action Buttons: Save & Close */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Done
          </button>

          <button
            type="button"
            onClick={handleSaveFace}
            disabled={!stagedPhoto}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all ${
              !stagedPhoto
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/60'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 cursor-pointer'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Biometric Face for {currentPerson.name}</span>
          </button>
        </div>

        {/* Household Overview Bar */}
        <div className="pt-2 border-t border-zinc-800/80">
          <p className="text-[10px] font-mono text-zinc-500 text-center">
            • Each person's face template is saved in local encrypted biometric state and verified during movie access checks.
          </p>
        </div>

      </div>
    </div>
  );
};
