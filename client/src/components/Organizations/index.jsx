import React from 'react';
import { Helmet } from 'react-helmet';
import { SITE_TITLE } from '../../constants';

export const Organizations = () => {
  return (
    <div className="orgs-container">
      <Helmet>
        <title>Đơn vị | {SITE_TITLE}</title>
      </Helmet>
      <h3 className="text-center">Quản lý đơn vị</h3>
    </div>
  );
};
