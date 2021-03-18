import React, { useState, useEffect, useContext } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { Form, Table, Button, ButtonGroup } from 'react-bootstrap';
import { AddSubnet } from './AddSubnet';
import { EditSubnet } from './EditSubnet';
import { DeleteRecord } from '../../DeleteRecord';
import { Paging } from '../../Paging';
import { UserContext, AlertContext } from '../../../contexts';
import { dhcpApi, tokenConfig } from '../../../utils';
import { ALERT_TYPE, PAGE_SIZES } from '../../../constants';
import './styles.scss';

export const SubnetInfo = () => {
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
    vlan: '',
    fullName: '',
  });

  const fetchData = () =>
    dhcpApi
      .get('/subnets', { ...tokenConfig(user), params })
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
      .post('/subnets', data, tokenConfig(user))
      .then(() => {
        unstable_batchedUpdates(() => {
          setParams({
            ...params,
            page: 0,
            vlan: '',
            fullName: '',
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
      .patch(`/subnets/${id}`, data, tokenConfig(user))
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
      .delete(`/subnets/${id}`, tokenConfig(user))
      .then(() => {
        unstable_batchedUpdates(() => {
          if (records.length > 1) {
            setRecordCount(recordCount - 1);
            setRecords(records.filter(item => item.id !== id));
          } else if (recordCount > 1) {
            setParams({ ...params, page: params.page - 1 });
          } else {
            setParams({ ...params, page: 0, vlan: '', fullName: '' });
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

  useEffect(() => fetchOrgList(), []);
  useEffect(() => fetchData(), [params.page, refetch, toLastPage]);

  return (
    <div className="subnet-info-container block-content">
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
          <Form className="d-flex align-items-center" onSubmit={handleFilter}>
            <Form.Group
              className="d-flex align-items-center mr-3"
              controlId="formVlan"
            >
              <span className="mr-2 font-w500">Tên VLAN:</span>
              <Form.Control
                type="text"
                placeholder="Nhập truy vấn"
                value={params.vlan}
                onChange={event =>
                  setParams({
                    ...params,
                    vlan: event.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group
              className="d-flex align-items-center mr-3"
              controlId="formFullName"
            >
              <span className="mr-2 font-w500">Tên đơn vị:</span>
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
          <AddSubnet doSubmit={addRecord} {...{ orgList }} />
        </div>
      </div>
      <Table hover>
        <thead className="thead-light">
          <tr>
            <th className="text-center">#</th>
            <th className="text-center">Tên VLAN</th>
            <th className="text-center">Đơn vị</th>
            <th className="text-center">Địa chỉ subnet</th>
            <th className="text-center">Subnet mask</th>
            <th className="text-center">Địa chỉ IP đầu</th>
            <th className="text-center">Địa chỉ IP cuối</th>
            <th className="text-center">Gateway</th>
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
                {item.vlan}
              </td>
              <td className="text-center font-size-sm">
                {item.organization.fullName}
              </td>
              <td className="text-center font-size-sm">{item.subnet}</td>
              <td className="text-center font-size-sm">{item.mask}</td>
              <td className="text-center font-size-sm">{item.firstIP}</td>
              <td className="text-center font-size-sm">{item.lastIP}</td>
              <td className="text-center font-size-sm">{item.gateway}</td>
              <td className="text-center font-size-sm">
                <ButtonGroup>
                  <EditSubnet
                    doSubmit={editRecord}
                    initialData={item}
                    {...{ orgList }}
                  />
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
