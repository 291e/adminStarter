import type { ZodTypeAny } from 'zod';

import dayjs from 'dayjs';
import { z as zod } from 'zod';

// ----------------------------------------------------------------------

type MessageMapProps = {
  required?: string;
  invalid_type?: string;
};

export const schemaHelper = {
  /**
   * Phone number
   * Apply for phone number input.
   * 전화번호 입력 필드에 사용되는 Zod 스키마입니다.
   * - 필수값 검증 및 최소 길이 1자 이상 체크
   * - isValid 함수가 제공되면 추가 유효성 검사 수행
   */
  phoneNumber: (props?: { message?: MessageMapProps; isValid?: (text: string) => boolean }) =>
    zod
      .string()
      .min(1, { message: props?.message?.required ?? 'Phone number is required!' })
      .refine((data) => (props?.isValid ? props.isValid(data) : true), {
        message: props?.message?.invalid_type ?? 'Invalid phone number!',
      }),
  /**
   * Date
   * Apply for date pickers.
   * 날짜 선택기 필드에 사용되는 Zod 스키마입니다.
   * - string, number, Date 객체, null을 모두 받아들임
   * - 빈 값(null, undefined, '')이면 필수 에러 발생
   * - dayjs로 유효한 날짜인지 검증
   */
  date: (props?: { message?: MessageMapProps }) =>
    zod.union([zod.string(), zod.number(), zod.date(), zod.null()]).transform((value, ctx) => {
      if (value === null || value === undefined || value === '') {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: props?.message?.required ?? 'Date is required!',
        });

        return null;
      }

      const isValid = dayjs(value).isValid();

      if (!isValid) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: props?.message?.invalid_type ?? 'Invalid date!',
        });
      }

      return value;
    }),
  /**
   * Editor
   * defaultValue === '' | <p></p>
   * Apply for editor
   * 리치 텍스트 에디터(예: `<p></p>` 등) 필드에 사용되는 Zod 스키마입니다.
   * - 최소 8자 이상의 문자열이어야 함 (빈 태그 제외)
   */
  editor: (props?: { message: string }) =>
    zod.string().min(8, { message: props?.message ?? 'Content is required!' }),
  /**
   * Nullable Input
   * Apply for input, select... with null value.
   * nullable 타입의 입력 필드에 사용되는 Zod 스키마입니다.
   * - null/undefined 값을 받을 수 있지만, 값이 없으면 필수 에러 발생
   * - 기존 Zod 스키마를 nullable로 래핑하여 사용
   */
  nullableInput: <T extends ZodTypeAny>(schema: T, options?: { message?: string }) =>
    schema.nullable().transform((val, ctx) => {
      if (val === null || val === undefined) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: options?.message ?? 'Field is required!',
        });
        return val;
      }
      return val;
    }),
  /**
   * Boolean
   * Apply for checkbox, switch...
   * 체크박스/스위치 등 boolean 필드에 사용되는 Zod 스키마입니다.
   * - true 값만 허용 (false면 필수 에러 발생)
   */
  boolean: (props?: { message: string }) =>
    zod.boolean().refine((val) => val, {
      message: props?.message ?? 'Field is required!',
    }),
  /**
   * Slider
   * Apply for slider with range [min, max].
   * 범위 슬라이더 필드에 사용되는 Zod 스키마입니다.
   * - 숫자 배열 [min, max] 형식 검증
   * - 첫 번째 값은 props.min 이상, 두 번째 값은 props.max 이하여야 함
   */
  sliderRange: (props: { message?: string; min: number; max: number }) =>
    zod
      .number()
      .array()
      .refine((data) => data[0] >= props?.min && data[1] <= props?.max, {
        message: props.message ?? `Range must be between ${props?.min} and ${props?.max}`,
      }),
  /**
   * File
   * Apply for upload single file.
   * 단일 파일 업로드 필드에 사용되는 Zod 스키마입니다.
   * - File 객체 또는 비어있지 않은 문자열만 허용
   * - 값이 없으면 필수 에러 발생
   */
  file: (props?: { message: string }) =>
    zod.custom<File | string | null>().transform((data, ctx) => {
      const hasFile = data instanceof File || (typeof data === 'string' && !!data.length);

      if (!hasFile) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: props?.message ?? 'File is required!',
        });
        return null;
      }

      return data;
    }),
  /**
   * Files
   * Apply for upload multiple files.
   * 다중 파일 업로드 필드에 사용되는 Zod 스키마입니다.
   * - File 객체 또는 문자열 배열 형식 검증
   * - 최소 파일 개수(minFiles, 기본값 2) 검증
   */
  files: (props?: { message: string; minFiles?: number }) =>
    zod.array(zod.custom<File | string>()).transform((data, ctx) => {
      const minFiles = props?.minFiles ?? 2;

      if (!data.length) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: props?.message ?? 'Files is required!',
        });
      } else if (data.length < minFiles) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: `Must have at least ${minFiles} items!`,
        });
      }

      return data;
    }),
};

// ----------------------------------------------------------------------

/**
 * Test one or multiple values against a Zod schema.
 * Zod 스키마에 대해 하나 이상의 값을 테스트하는 디버깅 유틸리티 함수입니다.
 * - 콘솔에 성공/실패 결과를 색상으로 구분하여 출력
 * - 개발 시 스키마 검증 로직 테스트에 사용
 */
export function testCase<T extends ZodTypeAny>(schema: T, inputs: unknown[]) {
  const textGreen = (text: string) => `\x1b[32m${text}\x1b[0m`;
  const textRed = (text: string) => `\x1b[31m${text}\x1b[0m`;
  const textGray = (text: string) => `\x1b[90m${text}\x1b[0m`;

  inputs.forEach((input) => {
    const result = schema.safeParse(input);
    const type = textGray(`(${typeof input})`);
    const value = JSON.stringify(input);

    const successValue = textGreen(`✅ Valid - ${value}`);
    const errorValue = textRed(`❌ Error - ${value}`);

    if (!result.success) {
      console.info(`${errorValue} ${type}:`, JSON.stringify(result.error.format(), null, 2));
    } else {
      console.info(`${successValue} ${type}:`, JSON.stringify(result.data, null, 2));
    }
  });
}

// Example usage:
// testCase(schemaHelper.boolean(), [true, false, 'true', 'false', '', 1, 0, null, undefined]);

// testCase(schemaHelper.date(), [
//   '2025-04-10',
//   1712736000000,
//   new Date(),
//   '2025-02-30',
//   '04/10/2025',
//   'not-a-date',
//   '',
//   null,
//   undefined,
// ]);

// testCase(
//   schemaHelper.nullableInput(
//     zod
//       .number({ coerce: true })
//       .int()
//       .min(1, { message: 'Age is required!' })
//       .max(80, { message: 'Age must be between 1 and 80' })
//   ),
//   [2, '2', 79, '79', 81, '81', null, undefined]
// );
