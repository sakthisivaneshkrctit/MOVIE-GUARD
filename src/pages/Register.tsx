import React, { useState, useRef } from 'react';
import { 
  Shield, Mail, Lock, User as UserIcon, Calendar, Camera, 
  AlertCircle, ArrowRight, Sparkles, CreditCard, CheckCircle2, 
  Upload, Check, KeyRound, LockKeyhole, Plus, AlertTriangle 
} from 'lucide-react';
import { AppRoute, User } from '../types';
import { store } from '../services/store';
import { WebcamCapture } from '../components/WebcamCapture';
import { 
  formatAadhaarNumber, cleanAadhaarNumber, validateOfficialAadhaar, lookupOfficialAadhaar,
  calculateAgeFromDob, getDobFromAge, OfficialCitizen, getAllOfficialCitizens
} from '../services/aadhaarUtils';
import { createSyntheticFaceDataUrl } from '../services/faceAnalysis';

interface RegisterProps {
  onNavigate: (route: AppRoute, params?: any) => void;
  onRegisterSuccess: (user: User) => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigate, onRegisterSuccess }) => {
  const initialCitizens = getAllOfficialCitizens();
  const defaultCitizen = initialCitizens[0]; // Sakthi Sivanesh
  
  const [name, setName] = useState(defaultCitizen.name);
  const [email, setEmail] = useState(defaultCitizen.sampleEmail);
  const [password, setPassword] = useState('secure123');
  const [confirmPassword, setConfirmPassword] = useState('secure123');
  const [aadhaarNumber, setAadhaarNumber] = useState(defaultCitizen.aadhaarNumber);
  const [dob, setDob] = useState(defaultCitizen.dob);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(defaultCitizen.gender);
  const [webcamPhotoUrl, setWebcamPhotoUrl] = useState<string>(createSyntheticFaceDataUrl(defaultCitizen.name));
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [isAgeFixedByAadhaar, setIsAgeFixedByAadhaar] = useState(true);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const calculatedAge = calculateAgeFromDob(dob);

  // Auto-fixes Name, Age, DOB, and Gender immediately upon typing 12-digit Aadhaar number
  const handleAadhaarChange = (val: string) => {
    const formatted = formatAadhaarNumber(val);
    setAadhaarNumber(formatted);
    const clean = cleanAadhaarNumber(formatted);

    if (clean.length === 12) {
      // Check duplicate
      const isAlreadyUsed = store.isAadhaarNumberUsed(formatted);
      if (isAlreadyUsed) {
        setIsDuplicate(true);
        setIsAgeFixedByAadhaar(false);
        setError(`❌ DUPLICATE AADHAAR DETECTED: UID "${formatted}" is already registered in the system! Each individual must have a unique Aadhaar.`);
        setSuccessInfo(null);
        return;
      }

      setIsDuplicate(false);
      const citizen = lookupOfficialAadhaar(formatted);
      if (citizen) {
        setName(citizen.name);
        setDob(citizen.dob);
        setGender(citizen.gender);
        setEmail(citizen.sampleEmail);
        setWebcamPhotoUrl(createSyntheticFaceDataUrl(citizen.name));
        setIsAgeFixedByAadhaar(true);
        setError(null);
        setSuccessInfo(`✓ Aadhaar Recognized: ${citizen.name} • Fixed Age: ${citizen.age} Yrs (${citizen.age >= 18 ? 'Adult 18+' : 'Minor Under-18'}) • Gender: ${citizen.gender} — AUTO-FIXED & LOCKED`);
      }
    } else {
      setIsDuplicate(false);
      if (clean.length < 12) {
        setError(null);
      }
    }
  };

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          setWebcamPhotoUrl(result);
          setSuccessInfo('Facial picture uploaded successfully for biometric profile!');
          setTimeout(() => setSuccessInfo(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Official UIDAI Registry Check & Name Matching
    const officialCheck = validateOfficialAadhaar(aadhaarNumber, name);
    if (!officialCheck.valid) {
      setError(officialCheck.message);
      return;
    }

    // Check for duplicate Aadhaar
    if (store.isAadhaarNumberUsed(aadhaarNumber)) {
      setError(`Duplicate Aadhaar Alert: Aadhaar number "${aadhaarNumber}" is already registered. Each account holder and family member must have a distinct Aadhaar number.`);
      return;
    }

    if (calculatedAge < 5 || calculatedAge > 120) {
      setError('Please select a valid date of birth (age between 5 and 120).');
      return;
    }

    if (!webcamPhotoUrl) {
      setError('Facial profile picture is required. Please capture with webcam or upload a photo before registering.');
      return;
    }

    const res = store.register({
      name: name.trim(),
      email: email.trim(),
      password,
      age: calculatedAge,
      dob,
      gender,
      aadhaarNumber: formatAadhaarNumber(aadhaarNumber),
      webcamPhotoUrl: webcamPhotoUrl,
      role: 'USER',
      familyMembers: [],
    });

    if (res.success && res.user) {
      onRegisterSuccess(res.user);
      onNavigate('home');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-6 space-y-6 pb-16">
      
      {/* Registration Form Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-700 to-red-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-950/40">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Register Aadhaar & Biometric Face</h1>
          <p className="text-xs text-zinc-400 font-mono">
            Type only your 12-digit Aadhaar UID — Your Name, Age, and Gender are <strong>AUTO-FIXED</strong>.
          </p>
        </div>

        {/* Quick Test Demo Buttons for Teacher */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Quick Test Demo (1-Click for Teacher)
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Type 12 digits or click a pill
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
              <div className="text-[10px] text-zinc-400">Karthik Raja • 26 Yrs</div>
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
              <div className="text-[10px] text-zinc-400">Dhivya • 21 Yrs</div>
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
              <div className="text-[10px] text-zinc-400">Ananya • 14 Yrs</div>
              <div className="text-[9px] text-amber-400 font-bold">⛔ Minor (&lt;18)</div>
            </button>

            <button
              type="button"
              onClick={() => handleAadhaarChange('2841 9382 7105')}
              className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-red-500/40 hover:border-red-500/80 rounded-xl text-left transition-colors cursor-pointer"
            >
              <div className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Test Duplicate
              </div>
              <div className="text-xs font-mono text-zinc-100 font-bold">2841 9382 7105</div>
              <div className="text-[10px] text-zinc-400">Sakthi (Registered)</div>
              <div className="text-[9px] text-red-400 font-bold">❌ Blocked</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/60 text-xs text-red-300 flex items-start gap-2 font-mono shadow-lg">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successInfo && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-xs text-emerald-300 flex items-center gap-2 font-mono shadow-lg animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successInfo}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          
          {/* PRIMARY: 12-digit Aadhaar Card Number Input */}
          <div className="bg-zinc-950 border-2 border-red-500/50 rounded-2xl p-4 sm:p-5 space-y-2 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="font-mono text-zinc-200 font-bold flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-amber-400" />
                12-Digit Aadhaar Number (Type Here)
              </label>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                Auto-Fixes Age & Name
              </span>
            </div>

            <input
              type="text"
              required
              maxLength={14}
              value={aadhaarNumber}
              onChange={(e) => handleAadhaarChange(e.target.value)}
              placeholder="e.g. 5329 1847 9021"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white font-mono tracking-widest text-base focus:outline-none focus:border-red-500"
            />
            
            <p className="text-[11px] text-zinc-400 font-mono">
              • Simply type any 12-digit Aadhaar number. Name, Age, and Gender are automatically fixed and locked.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Name */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-mono text-zinc-400">Citizen Full Name</label>
                {isAgeFixedByAadhaar && (
                  <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                    <LockKeyhole className="w-3 h-3" /> Auto-Fixed by Aadhaar
                  </span>
                )}
              </div>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  readOnly={isAgeFixedByAadhaar}
                  placeholder="e.g. Sakthi Sivanesh"
                  className={`w-full border rounded-xl pl-10 pr-3 py-2.5 ${
                    isAgeFixedByAadhaar
                      ? 'bg-zinc-950/60 border-zinc-800 text-zinc-300 cursor-not-allowed'
                      : 'bg-zinc-950 border-zinc-800 text-white focus:outline-none focus:border-red-500'
                  }`}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="font-mono text-zinc-400">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sakthisivaneshkrctit@gmail.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="font-mono text-zinc-400">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="font-mono text-zinc-400">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

          </div>

          {/* Date of Birth & Fixed Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-mono text-zinc-400">Date of Birth</label>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                  calculatedAge >= 18 ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-red-950 text-red-400 border border-red-500/30'
                }`}>
                  <LockKeyhole className="w-2.5 h-2.5" />
                  Age: {calculatedAge} Yrs (FIXED) • {calculatedAge >= 18 ? 'Adult 18+' : 'Under 18 Minor'}
                </span>
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  readOnly={isAgeFixedByAadhaar}
                  className={`w-full border rounded-xl pl-10 pr-3 py-2.5 font-mono focus:outline-none ${
                    isAgeFixedByAadhaar
                      ? 'bg-zinc-950/60 border-zinc-800 text-zinc-300 cursor-not-allowed'
                      : 'bg-zinc-950 border-zinc-800 text-white focus:border-red-500'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-mono text-zinc-400">Gender</label>
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
                className={`w-full border rounded-xl px-3 py-2.5 focus:outline-none ${
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

          {/* Facial Biometric Face Capture & Picture Upload Module */}
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="font-mono text-zinc-200 font-bold text-xs flex items-center gap-2">
                <Camera className="w-4 h-4 text-red-500" />
                Aadhaar Biometric Face Enrollment (Webcam or Picture Upload)
              </label>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-[11px] font-mono flex items-center gap-1.5 cursor-pointer border border-zinc-700 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload Picture File</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoFileUpload}
            />

            <WebcamCapture
              onCapture={(url) => setWebcamPhotoUrl(url)}
              capturedPhotoUrl={webcamPhotoUrl}
            />
          </div>

          <button
            type="submit"
            disabled={isDuplicate || cleanAadhaarNumber(aadhaarNumber).length !== 12}
            className={`w-full py-3.5 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all mt-4 ${
              isDuplicate || cleanAadhaarNumber(aadhaarNumber).length !== 12
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/60'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/40 cursor-pointer'
            }`}
          >
            <span>
              {isDuplicate 
                ? 'Duplicate Aadhaar Blocked — Enter Unique UID' 
                : cleanAadhaarNumber(aadhaarNumber).length !== 12
                  ? `Type 12-Digit Aadhaar UID (${cleanAadhaarNumber(aadhaarNumber).length}/12 Digits)`
                  : 'Complete Aadhaar Registration & Biometric Save'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        <div className="text-center text-xs text-zinc-400 pt-2">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-red-400 hover:underline font-bold cursor-pointer"
          >
            Sign In Here
          </button>
        </div>

      </div>

    </div>
  );
};
