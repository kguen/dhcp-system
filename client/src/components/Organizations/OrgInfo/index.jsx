import React, { useState, useEffect, useContext } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { Form, Table, Pagination, Button, ButtonGroup } from 'react-bootstrap';
import { AddOrg } from './AddOrg';
import { EditOrg } from './EditOrg';
import { UserContext, AlertContext } from '../../../contexts';
import { dhcpApi, tokenConfig } from '../../../utils';
import { ALERT_TYPE, PAGE_SIZES } from '../../../constants';
import './styles.scss';
import { DeleteOrg } from './DeleteOrg';

export const OrgInfo = () => {
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
    abbreviation: '',
    fullName: '',
  });

  const fetchData = () => {
    dhcpApi
      .get('/orgs', { ...tokenConfig(user), params })
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
  };

  const addRecord = data =>
    dhcpApi
      .post('/orgs', data, tokenConfig(user))
      .then(() => {
        unstable_batchedUpdates(() => {
          setParams({
            ...params,
            page: 0,
            abbreviation: '',
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
          err.response.data.errors.name === 'SequelizeUniqueConstraintError'
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
      .patch(`/orgs/${id}`, data, tokenConfig(user))
      .then(({ data: { result } }) => {
        setRecords(records.map(item => (item.id === id ? result : item)));
        setAlert({
          message: 'Cập nhật bản ghi thành công!',
          type: ALERT_TYPE.success,
        });
      })
      .catch(err => {
        if (
          err.response.data.errors.name === 'SequelizeUniqueConstraintError'
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
      .delete(`/orgs/${id}`, tokenConfig(user))
      .then(() => {
        unstable_batchedUpdates(() => {
          if (records.length > 1) {
            setRecordCount(recordCount - 1);
            setRecords(records.filter(item => item.id !== id));
          } else if (recordCount > 1) {
            setParams({ ...params, page: params.page - 1 });
          } else {
            setParams({ ...params, page: 0, abbreviation: '', fullName: '' });
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

  const handleEntryCountChange = event => {
    setParams({ ...params, page: 0, size: event.target.value });
    setRefetch(!refetch);
  };

  useEffect(() => fetchData(), [params.page, refetch, toLastPage]);

  return (
    <div className="org-info-container block-content">
      <Form
        className="d-flex align-items-center justify-content-between"
        onSubmit={handleFilter}
      >
        <Form.Group
          className="d-flex align-items-center"
          controlId="formEntryCount"
        >
          <Form.Control
            as="select"
            value={params.size}
            onChange={handleEntryCountChange}
          >
            {PAGE_SIZES.map(item => (
              <option key={item}>{item}</option>
            ))}
          </Form.Control>
          <span className="ml-2">bản ghi/trang</span>
        </Form.Group>
        <div className="d-flex justify-content-end align-items-center header-right">
          <Form.Group
            className="d-flex align-items-center mr-3"
            controlId="formAbbreviation"
          >
            <span className="mr-2 font-w500">Tên tắt:</span>
            <Form.Control
              type="text"
              placeholder="Nhập truy vấn"
              value={params.abbreviation}
              onChange={event =>
                setParams({
                  ...params,
                  abbreviation: event.target.value,
                })
              }
            />
          </Form.Group>
          <Form.Group
            className="d-flex align-items-center mr-3"
            controlId="formFullName"
          >
            <span className="mr-2 font-w500">Tên đầy đủ:</span>
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
          <AddOrg doSubmit={addRecord} />
        </div>
      </Form>
      <Table hover>
        <thead className="thead-light">
          <tr>
            <th className="text-center">#</th>
            <th className="text-center">Tên tắt</th>
            <th className="text-center">Tên đầy đủ</th>
            <th className="text-center">Điện thoại</th>
            <th className="text-center">Địa chỉ</th>
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
                {item.abbreviation}
              </td>
              <td className="text-center font-size-sm">{item.fullName}</td>
              <td className="text-center font-size-sm">{item.phone}</td>
              <td className="text-center font-size-sm">{item.address}</td>
              <td className="text-center font-size-sm">
                <ButtonGroup>
                  <EditOrg doSubmit={editRecord} initialData={item} />
                  <DeleteOrg doSubmit={deleteRecord} recordId={item.id} />
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="paging d-flex align-items-center justify-content-between">
        <span className="page-index mb-3">
          <strong>
            {params.page * params.size + 1} -{' '}
            {Math.min(recordCount, (params.page + 1) * params.size)}
          </strong>{' '}
          trong số <strong>{recordCount}</strong> bản ghi
        </span>
        <Pagination>
          <Pagination.First
            disabled={!params.page}
            onClick={() => setParams({ ...params, page: 0 })}
          >
            <i className="fa fa-angle-double-left" />
          </Pagination.First>
          <Pagination.Prev
            disabled={!params.page}
            onClick={() => setParams({ ...params, page: params.page - 1 })}
          >
            <i className="fa fa-angle-left" />
          </Pagination.Prev>
          {[...Array(pageCount).keys()].map(item => (
            <Pagination.Item
              key={item}
              active={item === params.page}
              onClick={() => setParams({ ...params, page: item })}
            >
              {item + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={params.page === pageCount - 1}
            onClick={() => setParams({ ...params, page: params.page + 1 })}
          >
            <i className="fa fa-angle-right" />
          </Pagination.Next>
          <Pagination.Last
            disabled={params.page === pageCount - 1}
            onClick={() => setParams({ ...params, page: pageCount - 1 })}
          >
            <i className="fa fa-angle-double-right" />
          </Pagination.Last>
        </Pagination>
      </div>
    </div>
  );
};
