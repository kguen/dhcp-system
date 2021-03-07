import React from 'react';
import { Helmet } from 'react-helmet';
import { SITE_TITLE } from '../../constants';

export const Users = () => {
  return (
    <div className="users-container">
      <Helmet>
        <title>Người dùng | {SITE_TITLE}</title>
      </Helmet>
      <h3 className="text-center">Quản lý người dùng</h3>
    </div>
  );
};
