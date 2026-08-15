import React from 'react';
import { Smartphone, Download, QrCode, ExternalLink } from 'lucide-react';

export const MobileAppSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Application Mobile</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Module de téléchargement de l'application Vendeo Mobile
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-lg">
            Télécharger l'application mobile (Vendeo Mobile)
          </h4>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Scannez le code QR avec l'appareil photo de votre téléphone, ou visitez le lien ci-dessous quand vous le souhaitez pour télécharger l'application et suivre vos ventes instantanément.
        </p>

        {/* QR Code Placeholder Box */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
          <div className="w-36 h-36 mx-auto bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
            <QrCode className="w-32 h-32 text-slate-800" />
          </div>
          <p className="text-[11px] text-slate-400">Code QR de téléchargement rapide</p>
        </div>

        <div className="space-y-3 pt-2">
          <a
            href="https://vendeo.fikradevs.com/download"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/30 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger l'application maintenant</span>
          </a>

          <div className="px-4 py-3 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-center">
            <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1.5">
              <span>https://vendeo.fikradevs.com/download</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

