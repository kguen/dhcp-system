import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { SITE_TITLE } from '../../constants';
import { UserDevices } from './UserDevices';
import { BasicInfo } from './BasicInfo';
import './styles.scss';

export const Profile = () => {
  const [tab, setTab] = useState(1);

  return (
    <div className="nav-container content-container profile-container">
      <Helmet>
        <title>Thông tin tài khoản | {SITE_TITLE}</title>
      </Helmet>
      <h3 className="text-center">Thông tin tài khoản</h3>
      <div className="block block-rounded">
        <ul
          className="nav nav-tabs nav-tabs-block justify-content-center"
          role="tablist"
        >
          <li className="nav-item">
            <span
              role="button"
              tabIndex={0}
              className={`nav-link ${tab === 0 ? 'active' : ''}`}
              onClick={() => setTab(0)}
            >
              Thông tin cơ bản
            </span>
          </li>
          <li className="nav-item">
            <span
              role="button"
              tabIndex={0}
              className={`nav-link ${tab === 1 ? 'active' : ''}`}
              onClick={() => setTab(1)}
            >
              Danh sách thiết bị
            </span>
          </li>
        </ul>
        {tab === 0 && <BasicInfo />}
        {tab === 1 && <UserDevices />}
      </div>
    </div>
  );
};
