import React, { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet';
import { Form, Table, Pagination, Button, ButtonGroup } from 'react-bootstrap';
import { UserContext, AlertContext } from '../../contexts';
import { dhcpApi, tokenConfig } from '../../utils';
import { ALERT_TYPE, SITE_TITLE, PAGE_SIZES } from '../../constants';
import './styles.scss';

export const Organizations = () => {
  const [records, setRecords] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [recordCount, setRecordCount] = useState(0);
  const [filter, setFilter] = useState(true);
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
      .then(({ data }) => {
        setRecords(data.records);
        setPageCount(data.pageCount);
        setRecordCount(data.recordCount);
      })
      .catch(() =>
        setAlert({
          message: 'Đã xảy ra lỗi máy chủ!',
          type: ALERT_TYPE.error,
        })
      );
  };

  const handleFilter = event => {
    event.preventDefault();
    setFilter(!filter);
  };

  useEffect(() => fetchData(), [params.page]);

  useEffect(() => {
    if (params.page) {
      setParams({ ...params, page: 0 });
    } else {
      fetchData();
    }
  }, [params.size, filter]);

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
            <span className="nav-link active">Thông tin cơ bản</span>
          </li>
          <li className="nav-item">
            <span className="nav-link">Thông tin subnet</span>
          </li>
        </ul>
        <div className="block-content">
          <Form
            className="d-flex align-items-center justify-content-between"
            onSubmit={event => handleFilter(event)}
          >
            <Form.Group
              className="d-flex align-items-center"
              controlId="formEntryCount"
            >
              <Form.Control
                as="select"
                value={params.size}
                onChange={event =>
                  setParams({
                    ...params,
                    size: event.target.value,
                  })
                }
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
                <th className="text-center">Tên tắt</th>
                <th className="text-center">Tên đầy đủ</th>
                <th className="text-center">Điện thoại</th>
                <th className="text-center">Địa chỉ</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {records.map(item => (
                <tr key={item.id}>
                  <td className="text-center font-w500 font-size-sm text-primary">
                    {item.id}
                  </td>
                  <td className="text-center font-w600 font-size-sm">
                    {item.abbreviation}
                  </td>
                  <td className="text-center font-size-sm">{item.fullName}</td>
                  <td className="text-center font-size-sm">{item.phone}</td>
                  <td className="text-center font-size-sm">{item.address}</td>
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
