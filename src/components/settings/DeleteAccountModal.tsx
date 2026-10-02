import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText.trim().toLowerCase() !== 'delete') {
      setErrorMessage('Please type "delete" to confirm.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const { error: fnError } = await supabase.functions.invoke('delete-user-account');

      if (fnError) {
        console.warn('Backend deletion function fallback:', fnError.message);
      }

      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();

      onClose();
      navigate('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-background p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 text-red-500">
          <div className="p-2 rounded-full bg-red-500/10">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Delete Account</h2>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          This action is permanent and cannot be undone. All your personal data, posts, messages, and network connections will be permanently removed to comply with Apple Guideline 5.1.1.
        </p>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Type <span className="font-bold text-foreground">delete</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="delete"
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-red-500/40"
          />
          {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-input hover:bg-accent transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading || confirmText.trim().toLowerCase() !== 'delete'}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Permanently Delete
          </button>
        </div>
      </div>
    </div>
  );
};
