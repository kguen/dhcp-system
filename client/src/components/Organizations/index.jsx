import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { SITE_TITLE } from '../../constants';
import { OrgInfo } from './OrgInfo';
import { SubnetInfo } from './SubnetInfo';
import './styles.scss';

export const Organizations = () => {
  const [tab, setTab] = useState(1);

  return (
    <div className="orgs-container content-container">
      <Helmet>
        <title>Đơn vị, Subnet | {SITE_TITLE}</title>
      </Helmet>
      <h3 className="text-center">Quản lý đơn vị / subnet</h3>
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
              Thông tin subnet
            </span>
          </li>
        </ul>
        {tab === 0 && <OrgInfo />}
        {tab === 1 && <SubnetInfo />}
      </div>
    </div>
  );
};
