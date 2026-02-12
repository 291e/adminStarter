import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import type { MouseEvent } from 'react';

// ----------------------------------------------------------------------

type Props = {
  toolbarId: string;
};

export const inquiryQuillModules = (toolbarId: string) => ({
  toolbar: {
    container: `#${toolbarId}`,
  },
});

export const inquiryQuillFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'script',
  'list',
  'indent',
  'align',
  'blockquote',
  'code-block',
  'link',
  'image',
];

export default function InquiryQuillToolbar({ toolbarId }: Props) {
  const handleToolbarButtonMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    // Keep focus/selection in the editor so toolbar applies in one click.
    event.preventDefault();
  };

  const tooltipProps = {
    placement: 'top' as const,
    arrow: true,
    disableInteractive: true,
    slotProps: {
      popper: {
        modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
      },
    },
  };

  return (
    <Box id={toolbarId} className="ql-toolbar ql-snow">
      <span className="ql-formats">
        <Tooltip title="제목 스타일" {...tooltipProps}>
          <select className="ql-header" defaultValue="">
            <option value="1">제목 1</option>
            <option value="2">제목 2</option>
            <option value="3">제목 3</option>
            <option value="">본문</option>
          </select>
        </Tooltip>
      </span>
      <span className="ql-formats">
        <Tooltip title="굵게" {...tooltipProps}>
          <button type="button" className="ql-bold" onMouseDown={handleToolbarButtonMouseDown} />
        </Tooltip>
        <Tooltip title="기울임" {...tooltipProps}>
          <button type="button" className="ql-italic" onMouseDown={handleToolbarButtonMouseDown} />
        </Tooltip>
        <Tooltip title="밑줄" {...tooltipProps}>
          <button
            type="button"
            className="ql-underline"
            onMouseDown={handleToolbarButtonMouseDown}
          />
        </Tooltip>
        <Tooltip title="취소선" {...tooltipProps}>
          <button type="button" className="ql-strike" onMouseDown={handleToolbarButtonMouseDown} />
        </Tooltip>
      </span>
      <span className="ql-formats">
        <Tooltip title="글자색" {...tooltipProps}>
          <select className="ql-color" />
        </Tooltip>
        <Tooltip title="배경색" {...tooltipProps}>
          <select className="ql-background" />
        </Tooltip>
      </span>
      <span className="ql-formats">
        <Tooltip title="아래첨자" {...tooltipProps}>
          <button
            type="button"
            className="ql-script"
            value="sub"
            onMouseDown={handleToolbarButtonMouseDown}
          />
        </Tooltip>
        <Tooltip title="위첨자" {...tooltipProps}>
          <button
            type="button"
            className="ql-script"
            value="super"
            onMouseDown={handleToolbarButtonMouseDown}
          />
        </Tooltip>
      </span>
      <span className="ql-formats">
        <Tooltip title="번호 목록" {...tooltipProps}>
          <button
            type="button"
            className="ql-list"
            value="ordered"
            onMouseDown={handleToolbarButtonMouseDown}
          />
        </Tooltip>
        <Tooltip title="글머리 기호" {...tooltipProps}>
          <button
            type="button"
            className="ql-list"
            value="bullet"
            onMouseDown={handleToolbarButtonMouseDown}
          />
        </Tooltip>
        <Tooltip title="들여쓰기 감소" {...tooltipProps}>
          <button
            type="button"
            className="ql-indent"
            value="-1"
            onMouseDown={handleToolbarButtonMouseDown}
          />
        </Tooltip>
        <Tooltip title="들여쓰기 증가" {...tooltipProps}>
          <button
            type="button"
            className="ql-indent"
            value="+1"
            onMouseDown={handleToolbarButtonMouseDown}
          />
        </Tooltip>
      </span>
      <span className="ql-formats">
        <Tooltip title="왼쪽 정렬" {...tooltipProps}>
          <button type="button" className="ql-align" value="" onMouseDown={handleToolbarButtonMouseDown} />
        </Tooltip>
        <Tooltip title="가운데 정렬" {...tooltipProps}>
          <button
            type="button"
            className="ql-align"
            value="center"
            onMouseDown={handleToolbarButtonMouseDown}
          />
        </Tooltip>
        <Tooltip title="오른쪽 정렬" {...tooltipProps}>
          <button
            type="button"
            className="ql-align"
            value="right"
            onMouseDown={handleToolbarButtonMouseDown}
          />
        </Tooltip>
        <Tooltip title="양쪽 정렬" {...tooltipProps}>
          <button
            type="button"
            className="ql-align"
            value="justify"
            onMouseDown={handleToolbarButtonMouseDown}
          />
        </Tooltip>
      </span>
      <span className="ql-formats">
        <Tooltip title="인용" {...tooltipProps}>
          <button
            type="button"
            className="ql-blockquote"
            onMouseDown={handleToolbarButtonMouseDown}
          />
        </Tooltip>
        <Tooltip title="코드 블록" {...tooltipProps}>
          <button
            type="button"
            className="ql-code-block"
            onMouseDown={handleToolbarButtonMouseDown}
          />
        </Tooltip>
        <Tooltip title="링크" {...tooltipProps}>
          <button type="button" className="ql-link" onMouseDown={handleToolbarButtonMouseDown} />
        </Tooltip>
        <Tooltip title="서식 지우기" {...tooltipProps}>
          <button type="button" className="ql-clean" onMouseDown={handleToolbarButtonMouseDown} />
        </Tooltip>
      </span>
    </Box>
  );
}
