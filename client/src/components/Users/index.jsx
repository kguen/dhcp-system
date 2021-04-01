import React, { useState, useEffect, useContext } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { Helmet } from 'react-helmet';
import { Form, Table, Button, ButtonGroup } from 'react-bootstrap';
import { AddUser } from './AddUser';
import { EditUser } from './EditUser';
import { DeleteRecord } from '../DeleteRecord';
import { Paging } from '../Paging';
import { UserContext, AlertContext } from '../../contexts';
import { dhcpApi, tokenConfig } from '../../utils';
import { ALERT_TYPE, SITE_TITLE, PAGE_SIZES } from '../../constants';
import DefaultAvatar from '../../assets/images/avatar.jpg';
import './styles.scss';

export const Users = () => {
  const [records, setRecords] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [recordCount, setRecordCount] = useState(0);
  const [refetch, setRefetch] = useState(true);
  const [toLastPage, setToLastPage] = useState(false);
  const [orgList, setOrgList] = useState([]);
  const { user } = useContext(UserContext);
  const { setAlert } = useContext(AlertContext);
  const [params, setParams] = useState({
    page: 0,
    size: PAGE_SIZES[1],
    email: '',
    fullName: '',
    organizationId: 0,
  });

  const fetchData = () =>
    dhcpApi
      .get('/users', { ...tokenConfig(user), params })
      .then(({ data }) =>
        unstable_batchedUpdates(() => {
          setRecords(data.records);
          setPageCount(data.pageCount);
          setRecordCount(data.recordCount);

          if (toLastPage) {
            setParams({ ...params, page: data.pageCount - 1 });
            setToLastPage(false);
          }
        })
      )
      .catch(() =>
        setAlert({
          message: 'Đã xảy ra lỗi máy chủ!',
          type: ALERT_TYPE.error,
        })
      );

  const fetchOrgList = () =>
    dhcpApi
      .get('/orgs/list', tokenConfig(user))
      .then(({ data }) => setOrgList(data))
      .catch(() =>
        setAlert({
          message: 'Đã xảy ra lỗi máy chủ!',
          type: ALERT_TYPE.error,
        })
      );

  const addRecord = data =>
    dhcpApi
      .post('/users', data, tokenConfig(user))
      .then(() => {
        unstable_batchedUpdates(() => {
          setParams({
            ...params,
            page: 0,
            email: '',
            fullName: '',
            organizationId: 0,
          });
          setRefetch(!refetch);
          setToLastPage(true);
        });
        setAlert({
          message: 'Thêm bản ghi thành công!',
          type: ALERT_TYPE.success,
        });
      })
      .catch(err => {
        if (
          err.response?.data?.errors?.name === 'SequelizeUniqueConstraintError'
        ) {
          throw new Error();
        } else {
          setAlert({
            message: 'Đã xảy ra lỗi máy chủ!',
            type: ALERT_TYPE.error,
          });
        }
      });

  const editRecord = (data, id) =>
    dhcpApi
      .patch(`/users/${id}`, data, tokenConfig(user))
      .then(({ data: { result } }) => {
        setRecords(records.map(item => (item.id === id ? result : item)));
        setAlert({
          message: 'Cập nhật bản ghi thành công!',
          type: ALERT_TYPE.success,
        });
      })
      .catch(err => {
        if (
          err.response?.data?.errors?.name === 'SequelizeUniqueConstraintError'
        ) {
          throw new Error();
        } else {
          setAlert({
            message: 'Đã xảy ra lỗi máy chủ!',
            type: ALERT_TYPE.error,
          });
        }
      });

  const deleteRecord = id =>
    dhcpApi
      .delete(`/users/${id}`, tokenConfig(user))
      .then(() => {
        unstable_batchedUpdates(() => {
          if (records.length > 1) {
            setRecordCount(recordCount - 1);
            setRecords(records.filter(item => item.id !== id));
          } else if (recordCount > 1) {
            setParams({ ...params, page: params.page - 1 });
          } else {
            setParams({
              ...params,
              page: 0,
              email: '',
              fullName: '',
              organizationId: 0,
            });
            setRefetch(!refetch);
          }
        });
        setAlert({
          message: 'Xóa bản ghi thành công!',
          type: ALERT_TYPE.success,
        });
      })
      .catch(() =>
        setAlert({
          message: 'Đã xảy ra lỗi máy chủ!',
          type: ALERT_TYPE.error,
        })
      );

  const handleFilter = event => {
    event.preventDefault();
    setParams({ ...params, page: 0 });
    setRefetch(!refetch);
  };

  const handlePageSizeChange = event => {
    setParams({ ...params, page: 0, size: +event.target.value });
    setRefetch(!refetch);
  };

  const handleOrgIdChange = event => {
    setParams({ ...params, page: 0, organizationId: +event.target.value });
    setRefetch(!refetch);
  };

  useEffect(() => fetchOrgList(), []);
  useEffect(() => fetchData(), [params.page, refetch, toLastPage]);

  return (
    <div className="content-container users-container">
      <Helmet>
        <title>Người dùng | {SITE_TITLE}</title>
      </Helmet>
      <h3 className="text-center">Quản lý người dùng</h3>
      <div className="block block-rounded">
        <div className="block-content">
          <div className="header-form-container d-flex align-items-center justify-content-between">
            <Form.Group
              className="d-flex align-items-center"
              controlId="formPageSize"
            >
              <Form.Control
                as="select"
                className="custom-select"
                value={params.size}
                onChange={handlePageSizeChange}
              >
                {PAGE_SIZES.map(item => (
                  <option key={item}>{item}</option>
                ))}
              </Form.Control>
              <span className="ml-2">bản ghi/trang</span>
            </Form.Group>
            <div className="d-flex justify-content-end align-items-center header-right">
              <Form.Group
                className="d-flex align-items-center mr-3 form-org-id"
                controlId="formOrgId"
              >
                <span className="mr-2 font-w500">Đơn vị:</span>
                <Form.Control
                  as="select"
                  className="custom-select"
                  value={params.organizationId}
                  onChange={handleOrgIdChange}
                >
                  <option value="0">Tất cả đơn vị</option>
                  {orgList.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.fullName}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form
                className="d-flex align-items-center"
                onSubmit={handleFilter}
              >
                <Form.Group
                  className="d-flex align-items-center mr-3"
                  controlId="formFullName"
                >
                  <span className="mr-2 font-w500">Họ và tên:</span>
                  <Form.Control
                    type="text"
                    placeholder="Nhập truy vấn"
                    value={params.fullName}
                    onChange={event =>
                      setParams({
                        ...params,
                        fullName: event.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group
                  className="d-flex align-items-center mr-3"
                  controlId="formEmail"
                >
                  <span className="mr-2 font-w500">Email:</span>
                  <Form.Control
                    type="text"
                    placeholder="Nhập truy vấn"
                    value={params.email}
                    onChange={event =>
                      setParams({
                        ...params,
                        email: event.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group className="mr-3">
                  <Button
                    type="submit"
                    className="d-flex align-items-center btn-alt-primary"
                  >
                    <i className="fa fa-fw fa-search mr-1" />
                    Tìm kiếm
                  </Button>
                </Form.Group>
              </Form>
              <AddUser doSubmit={addRecord} {...{ orgList }} />
            </div>
          </div>
          <Table hover>
            <thead className="thead-light">
              <tr>
                <th className="text-center">#</th>
                <th className="text-center">
                  <i className="si si-user" />
                </th>
                <th className="text-center">Họ và tên</th>
                <th className="text-center">Email</th>
                <th className="text-center">Điện thoại</th>
                <th className="text-center">Đơn vị</th>
                <th className="text-center">Chức vụ</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {records.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-center font-w500 font-size-sm text-primary">
                    {params.page * params.size + index + 1}
                  </td>
                  <td className="text-center">
                    <img
                      className="rounded-circle avatar"
                      width="30"
                      height="30"
                      src={
                        item?.avatar
                          ? `data:${item.avatar.type};base64,${item.avatar.data}`
                          : DefaultAvatar
                      }
                      alt="user avatar"
                    />
                  </td>
                  <td className="text-center font-w600 font-size-sm">
                    {item.fullName}
                  </td>
                  <td className="text-center font-size-sm">{item.email}</td>
                  <td className="text-center font-size-sm">{item.phone}</td>
                  <td className="text-center font-size-sm">
                    {item.organization?.fullName}
                  </td>
                  <td className="text-center font-size-sm font-w600">
                    {item.position && (
                      <span className="px-2 py-1 rounded bg-info-light text-info">
                        {item.position}
                      </span>
                    )}
                    {item.isAdmin && (
                      <span className="ml-1 px-2 py-1 rounded bg-success-light text-success">
                        Quản trị viên
                      </span>
                    )}
                  </td>
                  <td className="text-center font-size-sm">
                    <ButtonGroup>
                      <EditUser
                        doSubmit={editRecord}
                        initialData={item}
                        {...{ orgList }}
                      />
                      <DeleteRecord
                        doSubmit={deleteRecord}
                        recordId={item.id}
                      />
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Paging
            page={params.page}
            pageSize={params.size}
            setPage={value => setParams({ ...params, page: value })}
            {...{ pageCount, recordCount }}
          />
        </div>
      </div>
    </div>
  );
};
