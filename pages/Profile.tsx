
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { ImageInput } from '../components/shared/ImageInput';
import { AlertTriangle, Save, Shield, Mail, Lock, User as UserIcon, History, Trash2, Phone, MapPin } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onDeleteAccountSuccess: () => void;
  navigateTo: (page: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onDeleteAccountSuccess, navigateTo }) => {
  const nameParts = (user.fullName || '').trim().split(' ').filter(Boolean);
  const [username, setUsername] = useState(user.username);
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' '));
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [paymentMethod, setPaymentMethod] = useState(user.paymentMethod || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user.whatsappNumber || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState(user.email);
  const [emailOtp, setEmailOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isEmailConfirming, setIsEmailConfirming] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const normalizedNewEmail = newEmail.trim().toLowerCase();
  const isEmailChangePending = normalizedNewEmail && normalizedNewEmail !== user.email.toLowerCase();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      setIsLoading(false);
      return;
    }

    try {
      const updatedUser = await api.updateProfile({
        username,
        avatarUrl,
        password: password || undefined,
        fullName: `${firstName} ${lastName}`.trim(),
        phone,
        address,
        paymentMethod,
        whatsappNumber
      });
      onUpdateUser(updatedUser);
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await api.sendVerificationEmail();
      setMessage({ type: 'success', text: 'Email de vérification envoyé !' });
    } catch {
      setMessage({ type: 'error', text: "Erreur lors de l'envoi de l'email." });
    }
  };

  const handleRequestEmailChange = async () => {
    if (!isEmailChangePending) {
      setMessage({ type: 'error', text: 'Saisissez une nouvelle adresse email différente.' });
      return;
    }

    setIsEmailSending(true);
    setMessage({ type: '', text: '' });
    try {
      await api.requestEmailChange(normalizedNewEmail);
      setMessage({ type: 'success', text: 'Code envoyé au nouveau email. Saisissez le code pour confirmer le changement.' });
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : "Impossible d'envoyer le code." });
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleConfirmEmailChange = async () => {
    if (!isEmailChangePending || !emailOtp.trim()) {
      setMessage({ type: 'error', text: 'Nouvel email et code OTP obligatoires.' });
      return;
    }

    setIsEmailConfirming(true);
    setMessage({ type: '', text: '' });
    try {
      const updatedUser = await api.confirmEmailChange(normalizedNewEmail, emailOtp.trim());
      onUpdateUser(updatedUser);
      setNewEmail(updatedUser.email);
      setEmailOtp('');
      setMessage({ type: 'success', text: 'Adresse email mise à jour avec succès.' });
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Code OTP invalide ou expiré.' });
    } finally {
      setIsEmailConfirming(false);
    }
  };

  const handleDeleteAccount = async () => {
    setMessage({ type: '', text: '' });
    if (deleteConfirmation !== 'SUPPRIMER') {
      setMessage({ type: 'error', text: 'Veuillez saisir SUPPRIMER pour confirmer la suppression du compte.' });
      return;
    }

    setIsDeletingAccount(true);
    try {
      await api.deleteAccount(deleteConfirmation);
      onDeleteAccountSuccess();
    } catch (err: unknown) {
      console.error(err);
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erreur lors de la suppression du compte.' });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900 flex items-center">
          <UserIcon className="mr-3 text-indigo-600" size={32} /> Mon Profil
        </h1>
        <button 
          onClick={() => navigateTo('user-dashboard')}
          className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
        >
          <History size={16} className="mr-1" /> Voir mes commandes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="relative inline-block mb-4">
              <img 
                src={avatarUrl || 'https://via.placeholder.com/150'} 
                alt="Avatar" 
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm"></div>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user.username}</h2>
            <p className="text-sm text-slate-500 mb-4">{user.email}</p>
            <div className="flex justify-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user.role === UserRole.ADMIN ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
                {user.role}
              </span>
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                {user.balance.toFixed(2)} TND
              </span>
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="font-bold mb-2 flex items-center">
              <Shield size={18} className="mr-2" /> Sécurité
            </h3>
            <p className="text-xs text-indigo-100 mb-4">
              Gardez votre compte sécurisé en utilisant un mot de passe fort et en vérifiant votre adresse email.
            </p>
            {!user.emailVerified && (
              <button 
                onClick={handleVerifyEmail}
                className="w-full bg-white text-indigo-600 font-bold py-2 rounded-xl hover:bg-indigo-50 transition text-sm"
              >
                Vérifier mon email
              </button>
            )}
            {user.emailVerified && (
              <div className="flex items-center text-green-300 text-sm font-bold">
                <Mail size={16} className="mr-2" /> Email vérifié
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 flex items-center font-black text-slate-900">
              <Phone size={18} className="mr-2 text-indigo-600" /> Coordonnées
            </h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-slate-400" />
                <span className="truncate">{user.email}</span>
              </div>
              {phone && (
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-slate-400" />
                  <span>{phone}</span>
                </div>
              )}
              {address && (
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-slate-400" />
                  <span>{address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <h3 className="mb-2 flex items-center font-black text-red-900">
              <AlertTriangle size={18} className="mr-2" /> Zone sensible
            </h3>
            <p className="text-xs leading-6 text-red-700">
              La suppression du compte efface votre profil et votre panier. Vos anciennes commandes peuvent rester conservées pour le suivi, la facturation et le support.
            </p>
          </div>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prénom</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Votre nom"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom d'utilisateur</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email actuel</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 outline-none transition"
                    value={user.email}
                    disabled
                  />
                  {user.emailVerified && <p className="text-xs font-medium text-emerald-600">Email confirmé. Pour le changer, utilisez la validation par code ci-dessous.</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
                <h3 className="mb-4 flex items-center font-bold text-slate-900">
                  <Mail size={18} className="mr-2 text-indigo-600" /> Changer l’adresse email
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nouveau email</label>
                    <input
                      type="email"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-indigo-500"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="nouveau@email.com"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestEmailChange}
                    disabled={isEmailSending || !isEmailChangePending}
                    className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isEmailSending ? 'Envoi...' : 'Envoyer le code'}
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Code reçu</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center font-black tracking-[0.4em] outline-none transition focus:ring-2 focus:ring-indigo-500"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      placeholder="000000"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmEmailChange}
                    disabled={isEmailConfirming || !isEmailChangePending || emailOtp.trim().length < 6}
                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isEmailConfirming ? 'Validation...' : 'Confirmer email'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Numéro téléphone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+216 ..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+216 ..."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Adresse</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Adresse de livraison / facturation"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Méthode de paiement préférée</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="Ex: D17, virement, cash..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <ImageInput 
                  label="URL de l'Avatar"
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  placeholder="https://..."
                  uploadPreset="avatar"
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                  <Lock size={18} className="mr-2 text-slate-400" /> Changer le mot de passe
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nouveau mot de passe</label>
                    <input 
                      type="password" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Laisser vide pour ne pas changer"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmer le mot de passe</label>
                    <input 
                      type="password" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmez le nouveau mot de passe"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all flex items-center justify-center shadow-lg shadow-slate-200"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                Enregistrer les modifications
              </button>
            </form>
          </div>

          <div className="mt-8 rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-2 flex items-center text-sm font-black uppercase tracking-[0.18em] text-red-600">
                  <Trash2 size={16} className="mr-2" /> Suppression compte
                </div>
                <h3 className="text-2xl font-black text-slate-950">Supprimer définitivement mon compte</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  Cette action supprime vos informations de connexion et vous déconnecte immédiatement. Pour des raisons de facturation et de support, les commandes déjà passées restent consultables par l’administration sans lien actif vers votre compte.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tapez SUPPRIMER pour confirmer
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 font-bold text-red-900 outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="SUPPRIMER"
                />
              </div>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount || deleteConfirmation !== 'SUPPRIMER'}
                className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeletingAccount ? <Loader2 className="mr-2" /> : <Trash2 size={18} className="mr-2" />}
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default Profile;
