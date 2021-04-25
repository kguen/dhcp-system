import React from 'react';
import dayjs from 'dayjs';
import { COFF_MS } from '../../constants';

export const Banner = () => (
  <div className="banner progress-bar progress-bar-striped bg-default-op">
    <span className="font-w500 font-size-sm py-2">
      Lần cập nhật cấu hình DHCP tiếp theo của hệ thống:{' '}
      <strong>
        {dayjs(new Date(Math.ceil(new Date() / COFF_MS) * COFF_MS)).format(
          'HH:mm, DD/MM/YYYY'
        )}
      </strong>
      .{' '}
    </span>
  </div>
);
