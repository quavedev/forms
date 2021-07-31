import { useFormikContext } from 'formik';
import React from 'react';

export const DebugComponent = () => {
  const formikContext = useFormikContext();

  return (
    <pre
      style={{
        textAlign: 'left',
        backgroundColor: '#eee',
        padding: '1em',
        gridColumn: '1/-1',
        overflowX: 'scroll',
        color: '#000',
      }}
    >
      <code>{JSON.stringify(formikContext, null, 2)}</code>
    </pre>
  );
};
