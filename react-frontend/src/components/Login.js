import React, { useReducer } from 'react';
import { Label, TextInput, Button, Card, Alert } from 'flowbite-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../models/loginSchema';
import { loginReducer, initialLoginState } from '../reducers/loginReducer';

function Login({ onLogin, loading: globalLoading }) {
  const [state, dispatch] = useReducer(loginReducer, initialLoginState);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    dispatch({ type: 'LOADING' });
    try {
      await onLogin(data.email, data.password, (msg) => {
        if (msg) dispatch({ type: 'ERROR', payload: msg });
      });
      dispatch({ type: 'SUCCESS' });
    } catch {
      dispatch({ type: 'ERROR', payload: 'Login failed' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {(state.error || errors.email || errors.password) && (
          <Alert color="failure">
            {state.error || errors.email?.message || errors.password?.message}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email" value="Email" />
            <TextInput id="email" type="email" {...register('email')} autoComplete="username" />
          </div>
          <div>
            <Label htmlFor="password" value="Password" />
            <TextInput id="password" type="password" {...register('password')} autoComplete="current-password" />
          </div>
          <Button type="submit" isProcessing={state.loading || globalLoading} disabled={state.loading || globalLoading}>
            {(state.loading || globalLoading) ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default Login; 