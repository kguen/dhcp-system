import React from 'react';
import { Helmet } from 'react-helmet';
import { SITE_TITLE } from '../../constants';

export const Addresses = () => (
  <div className="content-container addresses-container">
    <Helmet>
      <title>Bản đồ IP | {SITE_TITLE}</title>
    </Helmet>
    <h3 className="text-center">Quản lý địa chỉ IP/MAC</h3>
  </div>
);
