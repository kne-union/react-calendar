import FormInfo, { Input, TextArea } from '@kne/form-info';
import { useIntl } from '@kne/react-intl';

const DefaultFormInner = () => {
  const { formatMessage } = useIntl();
  return (
    <FormInfo
      column={1}
      list={[
        <Input name="title" label={formatMessage({ id: 'DefaultFormInner.title' })} rule="REQ" placeholder={formatMessage({ id: 'DefaultFormInner.titlePlaceholder' })} block />,
        <TextArea name="detail" label={formatMessage({ id: 'DefaultFormInner.detail' })} placeholder={formatMessage({ id: 'DefaultFormInner.detailPlaceholder' })} block />
      ]}
    />
  );
};

export default DefaultFormInner;
