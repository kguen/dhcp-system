import React, { useContext } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { AlertContext, UserContext } from '../../contexts';
import Logo from '../../assets/images/logo.png';
import DefaultAvatar from '../../assets/images/avatar.jpg';
import { ALERT_TYPE } from '../../constants';
import './styles.scss';

export const Header = () => {
  const history = useHistory();
  const location = useLocation();
  const { user, setUser } = useContext(UserContext);
  const { setAlert } = useContext(AlertContext);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser({
      ...user,
      data: null,
      token: null,
    });
    setAlert({
      message: 'Đăng xuất thành công. Hãy đăng nhập lại để tiếp tục.',
      type: ALERT_TYPE.warning,
    });
    history.push('/login');
  };

  // eslint-disable-next-line react/display-name
  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <button
      type="button"
      className="btn btn-dual d-flex align-items-center"
      ref={ref}
      onClick={event => {
        event.preventDefault();
        onClick(event);
      }}
    >
      {children}
      <img
        className="rounded-circle avatar"
        width="21"
        height="21"
        src={
          user.data?.avatar
            ? `data:${user.data.avatar.type};base64,${user.data.avatar.data}`
            : DefaultAvatar
        }
        alt="user avatar"
      />
      <span className="d-none d-sm-inline-block ml-2 font-w500">
        {user.data?.fullName}
      </span>
      <i className="fa fa-fw fa-angle-down d-none d-sm-inline-block ml-1" />
    </button>
  ));

  return (
    !location.pathname.includes('login') && (
      <div className="header-container bg-white d-flex align-items-stretch justify-content-between">
        <Link
          to={user.data?.isAdmin ? '/orgs' : '/profile'}
          className="navbar-brand text-reset text-decoration-none logo d-flex align-items-center"
        >
          <img
            width="25"
            height="25"
            className="mr-1"
            alt="uet logo"
            src={Logo}
          />
          <span className="ml-2 font-w500">QUẢN TRỊ DHCP</span>
        </Link>
        {user.data?.isAdmin && (
          <ul className="nav nav-pills nav-justified">
            <li className="nav-item">
              <Link
                className={`nav-link d-flex align-items-center justify-content-center ${
                  location.pathname.includes('users') ? 'my-active' : ''
                }`}
                to="/users"
              >
                <i className="fa fa-fw fa-user mr-2" /> Người dùng
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link d-flex align-items-center justify-content-center ${
                  location.pathname.includes('orgs') ? 'my-active' : ''
                }`}
                to="/orgs"
              >
                <i className="fa fa-fw fa-users mr-2" /> Đơn vị / Subnet
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link d-flex align-items-center justify-content-center ${
                  location.pathname.includes('devices') ? 'my-active' : ''
                }`}
                to="/devices"
              >
                <i className="fa fa-fw fa-network-wired mr-2" /> Bản đồ IP
              </Link>
            </li>
          </ul>
        )}
        <div className="profile d-flex align-self-center justify-content-end">
          <Dropdown>
            <Dropdown.Toggle as={CustomToggle} />
            <Dropdown.Menu className="border-0 p-0" align="right">
              <Dropdown.Header className="p-0 rounded-top">
                <div className="p-3 text-center rounded-top">
                  <img
                    className="img-avatar img-avatar-thumb avatar"
                    src={
                      user.data?.avatar
                        ? `data:${user.data.avatar.type};base64,${user.data.avatar.data}`
                        : DefaultAvatar
                    }
                    alt="user avatar"
                  />
                  <h6 className="mt-2 mb-0 font-w500">{user.data?.fullName}</h6>
                  {user.data?.position && (
                    <p className="mt-1 mb-0">{user.data?.position}</p>
                  )}
                  {user.data?.isAdmin && (
                    <p className="mt-1 mb-0">Quản trị viên</p>
                  )}
                </div>
              </Dropdown.Header>
              <Dropdown.Divider className="m-0" />
              <div className="py-2">
                {user.data?.isAdmin && (
                  <Dropdown.Item
                    className="px-3 py-2 d-flex align-items-center justify-content-between"
                    onClick={() => history.push(`/profile`)}
                  >
                    <span>Thay đổi thông tin</span>
                    <i className="fa fa-fw fa-edit" />
                  </Dropdown.Item>
                )}
                <Dropdown.Item
                  className="px-3 py-2 d-flex align-items-center justify-content-between"
                  onClick={handleLogout}
                >
                  <span>Đăng xuất</span>
                  <i className="fa fa-fw fa-sign-out-alt" />
                </Dropdown.Item>
              </div>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    )
  );
};
