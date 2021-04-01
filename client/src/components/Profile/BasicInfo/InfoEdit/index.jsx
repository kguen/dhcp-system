import React, { useState, useContext, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  PHONE_REGEX,
  ALERT_TYPE,
  MAX_AVATAR_SIZE,
} from '../../../../constants';
import { dhcpApi, tokenConfig, sanitized } from '../../../../utils';
import { UserContext, AlertContext } from '../../../../contexts';
import DefaultAvatar from '../../../../assets/images/avatar.jpg';

const schema = yup.object({
  fullName: yup.string().trim().required('Vui lòng nhập họ và tên.'),
  email: yup.string().trim().email('Vui lòng nhập email theo đúng format.'),
  phone: yup.string().trim().matches(PHONE_REGEX, {
    message: 'Vui lòng nhập số điện thoại theo đúng format.',
    excludeEmptyString: true,
  }),
  organizationId: yup
    .number()
    .required()
    .positive('Vui lòng chọn đơn vị công tác.')
    .integer(),
  avatar: yup
    .mixed()
    .test(
      'fileSize',
      'Vui lòng chọn file có kích thước bé hơn 10MB.',
      value => !value?.length || value[0].size < MAX_AVATAR_SIZE
    ),
});

export const InfoEdit = () => {
  const [orgList, setOrgList] = useState([]);
  const { user, setUser } = useContext(UserContext);
  const { setAlert } = useContext(AlertContext);
  const {
    register,
    handleSubmit,
    errors,
    reset,
    watch,
    formState: { touched },
  } = useForm({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  });

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

  const onSubmit = data => {
    const formData = new FormData();

    Object.entries(sanitized(data)).forEach(([key, value]) => {
      if (key === 'avatar') {
        if (value?.length) {
          formData.append(key, value[0]);
        }
      } else {
        formData.append(key, value);
      }
    });
    dhcpApi
      .patch('/auth/update', formData, tokenConfig(user, true))
      .then(({ data: { user: result } }) => {
        setUser({ ...user, data: result });
        setAlert({
          message: 'Cập nhật thông tin thành công!',
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
  };

  useEffect(async () => {
    await fetchOrgList();
    reset({ ...user.data, avatar: null });
  }, []);

  return (
    <div className="info-edit-container">
      <div className="block-header">
        <h3 className="block-title">Cập nhật thông tin</h3>
      </div>
      <div className="block-content">
        <Form className="row push" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="col-4">
            <p className="font-size-sm text-muted">
              Vui lòng nhập đầy đủ và chính xác các thông tin cơ bản trong tài
              khoản của bạn.
            </p>
          </div>
          <div className="col-8">
            <Form.Group controlId="formFullName">
              <Form.Label className="required">Họ và tên</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                placeholder="Nhập họ và tên"
                ref={register}
                isValid={touched.fullName && !errors.fullName}
                isInvalid={!!errors.fullName}
              />
              <Form.Control.Feedback type="invalid">
                {errors.fullName?.message}
              </Form.Control.Feedback>

              <Form.Text className="text-muted">
                Nhập họ và tên đầy đủ (bao gồm tên đệm).
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Nhập email"
                ref={register}
                isValid={watch('email') && touched.email && !errors.email}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Nhập đia chỉ email của trường hoặc địa chỉ email cá nhân.
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="formPhone">
              <Form.Label>Điện thoại</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                placeholder="Nhập số điện thoại"
                ref={register}
                isValid={watch('phone') && touched.phone && !errors.phone}
                isInvalid={!!errors.phone}
              />
              <Form.Control.Feedback type="invalid">
                {errors.phone?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Nhập số điện thoại theo format SIM 10 số.
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="formOrgId">
              <Form.Label className="required">Đơn vị</Form.Label>
              <br />
              <Form.Control
                className="custom-select"
                as="select"
                name="organizationId"
                ref={register({
                  setValueAs: value => +value,
                })}
                isValid={touched.organizationId && !errors.organizationId}
                isInvalid={!!errors.organizationId}
              >
                <option value="0">Chọn đơn vị</option>
                {orgList.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.fullName}
                  </option>
                ))}
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                {errors.organizationId?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Lựa chọn đơn vị công tác (gồm tên phòng ban/bộ môn) phù hợp.
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="formPosition">
              <Form.Label>Chức vụ công tác</Form.Label>
              <Form.Control
                type="text"
                name="position"
                placeholder="Nhập chức vụ"
                ref={register}
              />
              <Form.Text className="text-muted">
                Nhập tên chức vụ của bạn trong đơn vị mà bạn đang công tác. Ví
                dụ: Giảng viên, quản trị viên...
              </Form.Text>
            </Form.Group>
            <Form.Group>
              <Form.Label className="my-label">Ảnh đại diện</Form.Label>
              <br />
              <img
                className="img-avatar img-avatar-thumb avatar mb-3"
                src={
                  watch('avatar')?.length
                    ? URL.createObjectURL(watch('avatar')[0])
                    : user.data?.avatar
                    ? `data:${user.data.avatar.type};base64,${user.data.avatar.data}`
                    : DefaultAvatar
                }
                alt="user avatar"
              />
              <div
                className={`custom-file ${
                  watch('avatar')?.length && touched.avatar && !errors.avatar
                    ? 'is-valid'
                    : ''
                } ${errors.avatar ? 'is-invalid' : ''}`}
              >
                <input
                  type="file"
                  name="avatar"
                  className={`custom-file-input ${
                    watch('avatar')?.length && touched.avatar && !errors.avatar
                      ? 'is-valid'
                      : ''
                  } ${errors.avatar ? 'is-invalid' : ''}`}
                  ref={register}
                />
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label
                  className={`font-w400 custom-file-label ${
                    watch('avatar')?.length ? '' : 'text-muted'
                  }`}
                >
                  {(watch('avatar')?.length && watch('avatar')[0].name) ||
                    'Chọn ảnh đại diện'}
                </label>
              </div>
              <Form.Control.Feedback type="invalid">
                {errors.avatar?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted mt-2">
                Ảnh đại diện của bạn sẽ được hiển thị trên thanh header trang
                web và danh sách người dùng. <br />
                Định dạng file: PNG hoặc JPEG.
              </Form.Text>
            </Form.Group>
            <Form.Group>
              <Button variant="alt-primary" type="submit">
                Cập nhật thông tin
              </Button>
            </Form.Group>
          </div>
        </Form>
      </div>
    </div>
  );
};
