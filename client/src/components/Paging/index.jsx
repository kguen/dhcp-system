import React from 'react';
import { Pagination } from 'react-bootstrap';
import './styles.scss';

export const Paging = ({ page, pageSize, recordCount, pageCount, setPage }) => (
  <div className="paging d-flex align-items-center justify-content-between">
    <span className="mb-3">
      <strong>
        {page * pageSize + 1} - {Math.min(recordCount, (page + 1) * pageSize)}
      </strong>{' '}
      trong số <strong>{recordCount}</strong> bản ghi
    </span>
    <Pagination>
      <Pagination.First disabled={!page} onClick={() => setPage(0)}>
        <i className="fa fa-angle-double-left" />
      </Pagination.First>
      <Pagination.Prev disabled={!page} onClick={() => setPage(page - 1)}>
        <i className="fa fa-angle-left" />
      </Pagination.Prev>
      {[...Array(pageCount).keys()].map(item => (
        <Pagination.Item
          key={item}
          active={item === page}
          onClick={() => setPage(item)}
        >
          {item + 1}
        </Pagination.Item>
      ))}
      <Pagination.Next
        disabled={page === pageCount - 1}
        onClick={() => setPage(page + 1)}
      >
        <i className="fa fa-angle-right" />
      </Pagination.Next>
      <Pagination.Last
        disabled={page === pageCount - 1}
        onClick={() => setPage(pageCount - 1)}
      >
        <i className="fa fa-angle-double-right" />
      </Pagination.Last>
    </Pagination>
  </div>
);
