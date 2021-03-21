import React, { useState, useEffect, useContext } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { Helmet } from 'react-helmet';
import { Form, Table, Button, ButtonGroup } from 'react-bootstrap';
import { AddDevice } from './AddDevice';
import { EditDevice } from './EditDevice';
import { DeleteRecord } from '../DeleteRecord';
import { Paging } from '../Paging';
import { UserContext, AlertContext } from '../../contexts';
import { dhcpApi, tokenConfig } from '../../utils';
import { ALERT_TYPE, SITE_TITLE, PAGE_SIZES } from '../../constants';
import './styles.scss';

export const Devices = () => {
  const [records, setRecords] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [recordCount, setRecordCount] = useState(0);
  const [refetch, setRefetch] = useState(true);
  const [toLastPage, setToLastPage] = useState(false);
  const [orgList, setOrgList] = useState([]);
  const [userList, setUserList] = useState([]);
  const { user } = useContext(UserContext);
  const { setAlert } = useContext(AlertContext);
  const [params, setParams] = useState({
    page: 0,
    size: PAGE_SIZES[1],
    enabled: true,
    type: '',
    userId: 0,
    organizationId: 0,
  });

  const fetchData = () =>
    dhcpApi
      .get('/devices', { ...tokenConfig(user), params })
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
      .get('/orgs/list', { ...tokenConfig(user), params: { hasSubnet: true } })
      .then(({ data }) => setOrgList(data))
      .catch(() =>
        setAlert({
          message: 'Đã xảy ra lỗi máy chủ!',
          type: ALERT_TYPE.error,
        })
      );

  const fetchUserList = () =>
    dhcpApi
      .get('/users/list', tokenConfig(user))
      .then(({ data }) => setUserList(data))
      .catch(() =>
        setAlert({
          message: 'Đã xảy ra lỗi máy chủ!',
          type: ALERT_TYPE.error,
        })
      );

  const addRecord = data =>
    dhcpApi
      .post('/devices', data, tokenConfig(user))
      .then(() => {
        unstable_batchedUpdates(() => {
          setParams({
            ...params,
            page: 0,
            enabled: true,
            type: '',
            userId: 0,
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
        if (err.response.data.type === 'AddressError') {
          throw new Error('AddressError');
        } else if (
          err.response?.data?.errors?.name === 'SequelizeUniqueConstraintError'
        ) {
          throw new Error('SequelizeUniqueConstraintError');
        } else {
          setAlert({
            message: 'Đã xảy ra lỗi máy chủ!',
            type: ALERT_TYPE.error,
          });
        }
      });

  const editRecord = (data, id) =>
    dhcpApi
      .patch(`/devices/${id}`, data, tokenConfig(user))
      .then(({ data: { result } }) => {
        setRecords(records.map(item => (item.id === id ? result : item)));
        setAlert({
          message: 'Cập nhật bản ghi thành công!',
          type: ALERT_TYPE.success,
        });
      })
      .catch(err => {
        if (err.response.data.type === 'AddressError') {
          throw new Error('AddressError');
        } else if (
          err.response?.data?.errors?.name === 'SequelizeUniqueConstraintError'
        ) {
          throw new Error('SequelizeUniqueConstraintError');
        } else {
          setAlert({
            message: 'Đã xảy ra lỗi máy chủ!',
            type: ALERT_TYPE.error,
          });
        }
      });

  const deleteRecord = id =>
    dhcpApi
      .delete(`/devices/${id}`, tokenConfig(user))
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
              enabled: true,
              type: '',
              userId: 0,
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

  const handleUserIdChange = event => {
    setParams({ ...params, page: 0, userId: +event.target.value });
    setRefetch(!refetch);
  };

  const handleEnabledChange = event => {
    setParams({ ...params, page: 0, enabled: event.target.checked });
    setRefetch(!refetch);
  };

  useEffect(() => fetchOrgList(), []);
  useEffect(() => fetchUserList(), []);
  useEffect(() => fetchData(), [params.page, refetch, toLastPage]);

  return (
    <div className="content-container devices-container">
      <Helmet>
        <title>Bản đồ IP | {SITE_TITLE}</title>
      </Helmet>
      <h3 className="text-center">Quản lý địa chỉ IP/MAC</h3>
      <div className="block block-rounded">
        <div className="block-content">
          <div className="d-flex align-items-center justify-content-between">
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
                className="d-flex align-items-center mr-3 form-select"
                controlId="formSearchOrgId"
              >
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
              <Form.Group
                className="d-flex align-items-center mr-3 form-select"
                controlId="formSearchUserId"
              >
                <Form.Control
                  as="select"
                  className="custom-select"
                  value={params.userId}
                  onChange={handleUserIdChange}
                >
                  <option value="0">Tất cả người dùng</option>
                  {userList
                    .filter(
                      item =>
                        !params.organizationId ||
                        item.organizationId === params.organizationId
                    )
                    .map(item => (
                      <option key={item.id} value={item.id}>
                        {item.fullName}
                      </option>
                    ))}
                </Form.Control>
              </Form.Group>
              <Form.Group
                className="d-flex align-items-center mr-3 mb-0"
                controlId="formSearchEnabled"
              >
                <Form.Check
                  type="switch"
                  className={`custom-control-lg pb-4 ${
                    params.enabled ? 'custom-control-success' : ''
                  }`}
                  name="enabled"
                  label="Đang hoạt động"
                  checked={params.enabled}
                  onChange={handleEnabledChange}
                />
              </Form.Group>
              <Form
                className="d-flex align-items-center"
                onSubmit={handleFilter}
              >
                <Form.Group
                  className="d-flex align-items-center mr-3"
                  controlId="formSearchType"
                >
                  <Form.Control
                    type="text"
                    placeholder="Nhập loại thiết bị"
                    value={params.type}
                    onChange={event =>
                      setParams({
                        ...params,
                        type: event.target.value,
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
              <AddDevice doSubmit={addRecord} {...{ orgList, userList }} />
            </div>
          </div>
          <Table hover>
            <thead className="thead-light">
              <tr>
                <th className="text-center">#</th>
                <th className="text-center">Đơn vị</th>
                <th className="text-center">Người dùng</th>
                <th className="text-center">Loại thiết bị</th>
                <th className="text-center">Địa chỉ MAC</th>
                <th className="text-center">Địa chỉ IP</th>
                <th className="text-center">Trạng thái</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {records.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-center font-w500 font-size-sm text-primary">
                    {params.page * params.size + index + 1}
                  </td>
                  <td className="text-center font-w600 font-size-sm">
                    {item.user.organization?.fullName}
                  </td>
                  <td className="text-center font-w600 font-size-sm">
                    {item.user.fullName}
                  </td>
                  <td className="text-center font-size-sm">{item.type}</td>
                  <td className="text-center font-size-sm">
                    {item.macAddress}
                  </td>
                  <td className="text-center font-size-sm">{item.ipAddress}</td>
                  <td className="text-center font-size-sm font-w600">
                    {item.enabled ? (
                      <span className="ml-1 px-2 py-1 rounded bg-success-light text-success">
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-danger-light text-danger">
                        Đã tắt
                      </span>
                    )}
                  </td>
                  <td className="text-center font-size-sm">
                    <ButtonGroup>
                      <EditDevice
                        doSubmit={editRecord}
                        initialData={item}
                        {...{ orgList, userList }}
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
