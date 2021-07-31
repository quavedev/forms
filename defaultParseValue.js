import { DateTimeType } from 'meteor/quave:custom-type-date-time/DateTimeType';
import { DateTime } from 'meteor/quave:custom-type-date-time';

export const defaultParseValue = (value, fieldDefinition) => {
  switch (fieldDefinition?.type) {
    case DateTimeType:
      return DateTime.parseDate(value);

    default:
      return value;
  }
};
