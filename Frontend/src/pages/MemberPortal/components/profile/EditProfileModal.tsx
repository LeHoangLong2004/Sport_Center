import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Check } from "lucide-react";
import { ProfileBasicFields } from "./editProfile/ProfileBasicFields";
import { ProfileGoalsSection } from "./editProfile/ProfileGoalsSection";

interface EditProfileModalProps {
  profile: any;
  storedUser: any;
  initialFullName: string;
  initialPhone: string;
  initialEmail: string;
  initialDob: string;
  initialGender: string;
  initialPreferredTime: string;
  initialEmergencyContact: string;
  initialFitnessGoal: string;
  initialFavoriteSportsStr: string;
  initialHealthNotes: string;
  initialWorkoutGoalsList: string[];
  isOpen: boolean;
  saving: boolean;
  message: { type: "success" | "error"; text: string } | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  profile,
  storedUser,
  initialFullName,
  initialPhone,
  initialEmail,
  initialDob,
  initialGender,
  initialPreferredTime,
  initialEmergencyContact,
  initialFitnessGoal,
  initialFavoriteSportsStr,
  initialHealthNotes,
  initialWorkoutGoalsList,
  isOpen,
  saving,
  message,
  onClose,
  onSave,
}) => {
  const [formFullName, setFormFullName] = useState(initialFullName);
  const [formPhone, setFormPhone] = useState(initialPhone);
  const [formEmail, setFormEmail] = useState(initialEmail);
  const [formDob, setFormDob] = useState(initialDob);
  const [formGender, setFormGender] = useState(
    initialGender && initialGender !== "Chưa cập nhật" ? initialGender : ""
  );
  const [formPreferredTime, setFormPreferredTime] = useState(initialPreferredTime);
  const [formEmergencyContact, setFormEmergencyContact] = useState(initialEmergencyContact);
  const [formFitnessGoal, setFormFitnessGoal] = useState(initialFitnessGoal);
  const [formFavoriteSportsStr, setFormFavoriteSportsStr] = useState(initialFavoriteSportsStr);
  const [formHealthNotes, setFormHealthNotes] = useState(initialHealthNotes);
  const [formGoalsList, setFormGoalsList] = useState<string[]>(initialWorkoutGoalsList);
  const [newGoalInput, setNewGoalInput] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      setFormFullName(profile?.fullName || initialFullName || storedUser?.fullName || storedUser?.name || "");
      setFormPhone(profile?.phone || initialPhone || storedUser?.phoneNumber || storedUser?.phone || "");
      setFormEmail(profile?.email || initialEmail || storedUser?.email || "");
      setFormDob(profile?.dob ? profile.dob.split("T")[0] : initialDob);
      setFormGender(
        profile?.gender && profile.gender !== "Chưa cập nhật"
          ? profile.gender
          : initialGender && initialGender !== "Chưa cập nhật"
          ? initialGender
          : ""
      );
      setFormPreferredTime(profile?.preferredTime || initialPreferredTime);
      setFormEmergencyContact(profile?.emergencyContact || initialEmergencyContact);
      setFormFitnessGoal(profile?.fitnessGoal || initialFitnessGoal);
      setFormFavoriteSportsStr(profile?.favoriteSports || initialFavoriteSportsStr);
      setFormHealthNotes(profile?.healthNotes || initialHealthNotes);
      const goals = profile?.workoutGoals
        ? profile.workoutGoals.split(",").map((g: string) => g.trim()).filter(Boolean)
        : initialWorkoutGoalsList;
      setFormGoalsList(goals);
      setNewGoalInput("");
    }
  }, [isOpen, profile]);

  const handleAddGoal = () => {
    const trimmed = newGoalInput.trim();
    if (!trimmed || formGoalsList.includes(trimmed)) return;
    setFormGoalsList([...formGoalsList, trimmed]);
    setNewGoalInput("");
  };

  const handleRemoveGoal = (index: number) => {
    setFormGoalsList(formGoalsList.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      fullName: formFullName,
      phone: formPhone,
      email: formEmail,
      dob: formDob,
      gender: formGender,
      preferredTime: formPreferredTime,
      emergencyContact: formEmergencyContact,
      fitnessGoal: formFitnessGoal,
      favoriteSports: formFavoriteSportsStr,
      healthNotes: formHealthNotes,
      workoutGoals: formGoalsList.join(", "),
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Chỉnh sửa thông tin hồ sơ
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-5 space-y-4 text-xs">
            {message && (
              <div
                className={`p-3 rounded-lg flex items-center gap-2 font-medium ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                }`}
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>{message.text}</span>
              </div>
            )}

            <ProfileBasicFields
              formFullName={formFullName}
              setFormFullName={setFormFullName}
              formPhone={formPhone}
              setFormPhone={setFormPhone}
              formEmail={formEmail}
              setFormEmail={setFormEmail}
              formDob={formDob}
              setFormDob={setFormDob}
              formGender={formGender}
              setFormGender={setFormGender}
              formPreferredTime={formPreferredTime}
              setFormPreferredTime={setFormPreferredTime}
              formEmergencyContact={formEmergencyContact}
              setFormEmergencyContact={setFormEmergencyContact}
              formFavoriteSportsStr={formFavoriteSportsStr}
              setFormFavoriteSportsStr={setFormFavoriteSportsStr}
              formFitnessGoal={formFitnessGoal}
              setFormFitnessGoal={setFormFitnessGoal}
              formHealthNotes={formHealthNotes}
              setFormHealthNotes={setFormHealthNotes}
            />

            <ProfileGoalsSection
              formGoalsList={formGoalsList}
              newGoalInput={newGoalInput}
              setNewGoalInput={setNewGoalInput}
              onAddGoal={handleAddGoal}
              onRemoveGoal={handleRemoveGoal}
            />
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm transition-colors"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
