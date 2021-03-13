import React, { useState, useEffect, useContext } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { Helmet } from 'react-helmet';
import { Form, Table, Pagination, Button, ButtonGroup } from 'react-bootstrap';
import { UserContext, AlertContext } from '../../contexts';
import { dhcpApi, tokenConfig } from '../../utils';
import { ALERT_TYPE, SITE_TITLE, PAGE_SIZES } from '../../constants';
import './styles.scss';

export const Users = () => {
  const [records, setRecords] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [recordCount, setRecordCount] = useState(0);
  const [refetch, setRefetch] = useState(true);
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

  const fetchData = () => {
    dhcpApi
      .get('/users', { ...tokenConfig(user), params })
      .then(({ data }) =>
        unstable_batchedUpdates(() => {
          setRecords(data.records);
          setPageCount(data.pageCount);
          setRecordCount(data.recordCount);
        })
      )
      .catch(() =>
        setAlert({
          message: 'Đã xảy ra lỗi máy chủ!',
          type: ALERT_TYPE.error,
        })
      );
  };

  const fetchOrgList = () => {
    dhcpApi
      .get('/orgs/list', tokenConfig(user))
      .then(({ data }) => setOrgList(data))
      .catch(() =>
        setAlert({
          message: 'Đã xảy ra lỗi máy chủ!',
          type: ALERT_TYPE.error,
        })
      );
  };

  const handleFilter = event => {
    event.preventDefault();
    setParams({ ...params, page: 0 });
    setRefetch(!refetch);
  };

  const handleEntryCountChange = event => {
    setParams({ ...params, page: 0, size: event.target.value });
    setRefetch(!refetch);
  };

  const handleOrgIdChange = event => {
    setParams({ ...params, page: 0, organizationId: +event.target.value });
    setRefetch(!refetch);
  };

  useEffect(() => fetchOrgList(), []);
  useEffect(() => fetchData(), [params.page, refetch]);

  return (
    <div className="content-container users-container">
      <Helmet>
        <title>Người dùng | {SITE_TITLE}</title>
      </Helmet>
      <h3 className="text-center">Quản lý người dùng</h3>
      <div className="block block-rounded">
        <div className="block-content">
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
                className="d-flex align-items-center mr-3 form-org-id"
                controlId="formOrgId"
              >
                <span className="mr-2 font-w500">Đơn vị:</span>
                <Form.Control
                  as="select"
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
              <Form.Group>
                <Button
                  type="submit"
                  className="d-flex align-items-center btn-alt-success"
                >
                  <i className="fa fa-fw fa-plus mr-1" />
                  Thêm
                </Button>
              </Form.Group>
            </div>
          </Form>
          <Table hover>
            <thead className="thead-light">
              <tr>
                <th className="text-center">#</th>
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
                  <td className="text-center font-w600 font-size-sm">
                    {item.fullName}
                  </td>
                  <td className="text-center font-size-sm">{item.email}</td>
                  <td className="text-center font-size-sm">{item.phone}</td>
                  <td className="text-center font-size-sm">
                    {item.organization.fullName}
                  </td>
                  <td className="text-center font-size-sm font-w600">
                    {item.position && (
                      <span
                        className={`px-2 py-1 rounded ${
                          item.isAdmin
                            ? 'bg-success-light text-success'
                            : 'bg-info-light text-info'
                        }`}
                      >
                        {item.position}
                      </span>
                    )}
                  </td>
                  <td className="text-center font-size-sm">
                    <ButtonGroup>
                      <Button className="btn-sm btn-alt-light">
                        <i className="fa fa-fw fa-pencil-alt" />
                      </Button>
                      <Button className="btn-sm btn-alt-light">
                        <i className="fa fa-fw fa-times" />
                      </Button>
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
      </div>
    </div>
  );
};
