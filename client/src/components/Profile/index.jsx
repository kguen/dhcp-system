import React from 'react';
import { Helmet } from 'react-helmet';
import { SITE_TITLE } from '../../constants';

export const Profile = () => (
  <div className="content-container profile-container">
    <Helmet>
      <title>Thông tin tài khoản | {SITE_TITLE}</title>
    </Helmet>
    <h3 className="text-center">Thông tin tài khoản</h3>
  </div>
);
