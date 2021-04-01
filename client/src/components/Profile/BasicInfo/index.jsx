import React from 'react';
import { InfoEdit } from './InfoEdit';
import { PasswordEdit } from './PasswordEdit';

export const BasicInfo = () => (
  <div className="basic-info-container block-content">
    <InfoEdit />
    <hr className="mx-3 mt-3 mb-4" />
    <PasswordEdit />
  </div>
);
