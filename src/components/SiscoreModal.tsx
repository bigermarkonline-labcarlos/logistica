import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, Lock, X } from 'lucide-react';
import type { Translations } from '../i18n/translations';
import {
  validateSiscoreLogin,
  type Language,
  type SiscoreLoginForm,
  type SiscoreRole,
} from '../utils/logistics';

interface SiscoreModalProps {
  open: boolean;
  lang: Language;
  t: Translations['siscoreModal'];
  onClose: () => void;
}

const ROLES: SiscoreRole[] = ['principal', 'operadores', 'clientes'];

export default function SiscoreModal({ open, lang, t, onClose }: SiscoreModalProps) {
  const [form, setForm] = useState<SiscoreLoginForm>({
    role: 'clientes',
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SiscoreLoginForm, string>>>({});
  const [submittedUser, setSubmittedUser] = useState<{
    roleLabel: string;
    username: string;
  } | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateSiscoreLogin(form, lang);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmittedUser({
      roleLabel: t.roles[form.role],
      username: form.username.trim(),
    });
    setForm((prev) => ({ ...prev, password: '' }));
  };

  const handleReset = () => {
    setSubmittedUser(null);
    setErrors({});
    setForm({ role: form.role, username: '', password: '' });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#042544]/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="siscore-modal-title"
      onClick={onClose}
    >
      <div
        className="relative bg-white border border-slate-200 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-[#F59E0B]" aria-hidden="true" />

        <button
          type="button"
          onClick={onClose}
          aria-label={t.closeAria}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-[#042544] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-5">
          <div className="pr-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#B45309]">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>SISCORE</span>
            </div>
            <h2
              id="siscore-modal-title"
              className="font-display text-2xl font-bold text-[#042544] mt-1"
            >
              {t.title}
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{t.subtitle}</p>
          </div>

          {submittedUser ? (
            <div
              className="p-5 rounded-xl bg-[#F6F8FB] border border-slate-200 space-y-3"
              data-testid="siscore-login-submitted"
            >
              <div className="flex items-center gap-2 text-[#B45309] font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{t.confirmedTitle}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {t.confirmedBodyPrefix}{' '}
                <strong className="text-[#042544]">{submittedUser.roleLabel}</strong>{' '}
                {t.confirmedBodyMid}{' '}
                <strong className="font-mono text-[#042544]">{submittedUser.username}</strong>.{' '}
                {t.confirmedBodySuffix}
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-bold text-[#042544] bg-[#F59E0B] hover:bg-amber-400 rounded-lg transition-colors cursor-pointer"
                >
                  {t.resetButton}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#042544] border border-slate-300 hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  {t.closeAria}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Role Selector: Principal / Operadores / Clientes */}
              <div>
                <span className="block text-xs font-semibold text-[#042544] mb-2">
                  {t.roleLabel}
                </span>
                <div
                  role="radiogroup"
                  aria-label={t.roleLabel}
                  className="grid grid-cols-3 gap-2 p-1 bg-[#F6F8FB] border border-slate-200 rounded-xl"
                >
                  {ROLES.map((roleKey) => {
                    const active = form.role === roleKey;
                    return (
                      <button
                        key={roleKey}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setForm((p) => ({ ...p, role: roleKey }))}
                        className={`py-2 px-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          active
                            ? 'bg-[#042544] text-white ring-1 ring-[#F59E0B] shadow-xs'
                            : 'text-slate-600 hover:text-[#042544] hover:bg-white/70'
                        }`}
                      >
                        {t.roles[roleKey]}
                      </button>
                    );
                  })}
                </div>
                {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role}</p>}
              </div>

              <div>
                <label
                  htmlFor="siscore-username"
                  className="block text-xs font-semibold text-[#042544] mb-1"
                >
                  {t.usernameLabel}
                </label>
                <input
                  id="siscore-username"
                  type="text"
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                  placeholder={t.usernamePlaceholder}
                  className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-[#042544] focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                />
                {errors.username && (
                  <p className="text-xs text-red-600 mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="siscore-password"
                  className="block text-xs font-semibold text-[#042544] mb-1"
                >
                  {t.passwordLabel}
                </label>
                <input
                  id="siscore-password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder={t.passwordPlaceholder}
                  className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-[#042544] focus:outline-none focus:border-[#042544] focus:ring-2 focus:ring-[#F59E0B]/30"
                />
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-5 text-sm font-bold text-[#042544] bg-[#F59E0B] hover:bg-amber-400 rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                {t.submitButton}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
