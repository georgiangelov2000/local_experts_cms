import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Base schema
export const userSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  role_id: yup.number().required('Role ID is required'),
});

// Provider schema
export const providerSchema = yup.object({
  business_name: yup.string().notRequired(),
  description: yup.string().notRequired(),
  category_id: yup.number().nullable(),
  service_category_id: yup.number().nullable(),
  start_time: yup.string().notRequired(),
  stop_time: yup.string().notRequired(),
  alias: yup.string().notRequired(),
  services: yup.array().of(
    yup.object({
      description: yup.string(),
      price: yup.number().nullable(),
    })
  ),
  workspaces: yup.array().of(
    yup.object({
      id: yup.number().nullable(),
      city_id: yup.number().nullable(),
    })
  ),
  certifications: yup.array().of(
    yup.object({
      name: yup.string(),
      description: yup.string(),
      link: yup.string(),
    })
  ),
  contacts: yup.array().of(
    yup.object({
      phone: yup.string(),
      email: yup.string(),
      address: yup.string(),
      website: yup.string(),
      facebook: yup.string(),
      instagram: yup.string(),
    })
  ),
});

export const useProviderSchema = () => {
  return useForm({
    defaultValues: {}, // Empty on mount
    resolver: yupResolver(userSchema.concat(providerSchema)), // Combined schema
  });
};
