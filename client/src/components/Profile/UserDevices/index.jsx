import React, { useState, useEffect, useContext } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { Form, Table, Button, ButtonGroup } from 'react-bootstrap';
import { AddUserDevice } from './AddUserDevice';
import { EditUserDevice } from './EditUserDevice';
import { DeleteRecord } from '../../DeleteRecord';
import { Paging } from '../../Paging';
import { UserContext, AlertContext } from '../../../contexts';
import { dhcpApi, tokenConfig } from '../../../utils';
import { ALERT_TYPE, PAGE_SIZES } from '../../../constants';

export const UserDevices = () => {
  const [records, setRecords] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [recordCount, setRecordCount] = useState(0);
  const [refetch, setRefetch] = useState(true);
  const [toLastPage, setToLastPage] = useState(false);
  const { user } = useContext(UserContext);
  const { setAlert } = useContext(AlertContext);
  const [params, setParams] = useState({
    page: 0,
    size: PAGE_SIZES[1],
    enabled: true,
    type: '',
  });

  const fetchData = () =>
    dhcpApi
      .get('/devices/user', { ...tokenConfig(user), params })
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

  const addRecord = data =>
    dhcpApi
      .post('/devices', { ...data, userId: user.id }, tokenConfig(user))
      .then(() => {
        unstable_batchedUpdates(() => {
          setParams({
            ...params,
            page: 0,
            enabled: true,
            type: '',
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
        if (
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

  const handleEnabledChange = event => {
    setParams({ ...params, page: 0, enabled: event.target.checked });
    setRefetch(!refetch);
  };

  useEffect(() => fetchData(), [params.page, refetch, toLastPage]);

  return (
    <div className="user-devices-container block-content">
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
        <div className="d-flex justify-content-end align-items-center">
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
          <Form className="d-flex align-items-center" onSubmit={handleFilter}>
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
          <AddUserDevice doSubmit={addRecord} />
        </div>
      </div>
      <Table hover>
        <thead className="thead-light">
          <tr>
            <th className="text-center">#</th>
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
                {item.type}
              </td>
              <td className="text-center font-size-sm">{item.macAddress}</td>
              <td className="text-center font-size-sm">{item.ipAddress}</td>
              <td className="text-center font-size-sm font-w600">
                {item.waiting ? (
                  <span className="ml-1 px-2 py-1 rounded bg-warning-light text-warning">
                    Đang chờ cập nhật
                  </span>
                ) : item.enabled ? (
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
                  <EditUserDevice doSubmit={editRecord} initialData={item} />
                  <DeleteRecord doSubmit={deleteRecord} recordId={item.id} />
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
  );
};
