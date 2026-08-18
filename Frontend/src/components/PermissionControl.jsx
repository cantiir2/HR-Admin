import React from 'react';
import { usePermission } from '../hooks/usePermission';

const PermissionControl = ({
  action,
  apiMethod,
  apiUrl,
  children,
  fallback = null
}) => {
  const { canAccess } = usePermission();

  const isAllowed = canAccess({ action, apiMethod, apiUrl });
  console.log('isAllowed', isAllowed);

  if (!isAllowed) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionControl;
