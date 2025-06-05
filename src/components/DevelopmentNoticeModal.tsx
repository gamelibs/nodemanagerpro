import React from 'react';
import { t } from '../services/i18n';

interface DevelopmentNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
}

export const DevelopmentNoticeModal: React.FC<DevelopmentNoticeModalProps> = ({
  isOpen,
  onClose,
  templateName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.963-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('projects.createModal.developmentNotice.title')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('projects.createModal.developmentNotice.subtitle')}
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            {t('projects.createModal.developmentNotice.message', { templateName })}
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              {t('projects.createModal.developmentNotice.comingSoon')}
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {t('projects.createModal.developmentNotice.features.completeSetup')}</li>
              <li>• {t('projects.createModal.developmentNotice.features.bestPractices')}</li>
              <li>• {t('projects.createModal.developmentNotice.features.fullDocumentation')}</li>
              <li>• {t('projects.createModal.developmentNotice.features.advancedFeatures')}</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('projects.createModal.developmentNotice.understood')}
          </button>
        </div>
      </div>
    </div>
  );
};
