import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';
import type { Table2400EducationRow, Table2400MinimumEducationRow } from '../../types/table-data';

// ----------------------------------------------------------------------

// 월 라벨
const MONTH_LABELS = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
] as const;

type Props = {
  rows: Table2400EducationRow[];
  onRowChange: (
    index: number,
    field: keyof Table2400EducationRow,
    value: string | boolean[] | number | '법정' | '자율'
  ) => void;
  onRowDelete: (index: number) => void;
  onRowMove: (fromIndex: number, toIndex: number) => void;
  onAddRow: () => void;
  minimumEducationRows: Table2400MinimumEducationRow[];
  onMinimumEducationRowChange: (
    index: number,
    field: keyof Table2400MinimumEducationRow,
    value: string
  ) => void;
};

export default function Table2400EducationForm({
  rows,
  onRowChange,
  onRowDelete,
  onRowMove,
  onAddRow,
  minimumEducationRows,
  onMinimumEducationRowChange,
}: Props) {
  const theme = useTheme();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onRowMove(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const tableStyle = {
    width: '100%',
    border: '2px solid',
    borderColor: 'text.primary',
    borderCollapse: 'collapse',
    '& th, & td': {
      border: '1px solid',
      borderColor: 'text.primary',
      padding: 0,
      textAlign: 'center',
      verticalAlign: 'middle',
    },
    '& th': {
      backgroundColor: 'grey.100',
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '22px',
    },
    '& td': {
      padding: '4px',
      height: 48,
    },
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
        <Box component="table" sx={tableStyle}>
          <thead>
            <tr style={{ height: 60 }}>
              <th style={{ width: 46 }} rowSpan={2}>
                순번
              </th>
              <th style={{ width: 112 }} colSpan={2}>
                교육구분
              </th>
              <th style={{ width: 226 }} rowSpan={2}>
                교육과정
              </th>
              <th style={{ width: 510 }} colSpan={12}>
                일정
              </th>
              <th style={{ width: 108 }} rowSpan={2}>
                대상 <br /> 인원(명)
              </th>
              <th style={{ width: 108 }} rowSpan={2}>
                교육방법 <br /> (내·외부)
              </th>
              <th style={{ width: 108 }} rowSpan={2}>
                비고
              </th>
              <th style={{ width: 46 }} rowSpan={2}>
                이동
              </th>
              <th style={{ width: 55 }} rowSpan={2}>
                삭제
              </th>
            </tr>
            <tr style={{ height: 60 }}>
              <th style={{ width: 56 }}>법정</th>
              <th style={{ width: 56 }}>자율</th>
              <th style={{ width: 43 }}>1월</th>
              <th style={{ width: 43 }}>2월</th>
              <th style={{ width: 42 }}>3월</th>
              <th style={{ width: 42 }}>4월</th>
              <th style={{ width: 43 }}>5월</th>
              <th style={{ width: 43 }}>6월</th>
              <th style={{ width: 42 }}>7월</th>
              <th style={{ width: 42 }}>8월</th>
              <th style={{ width: 43 }}>9월</th>
              <th style={{ width: 43 }}>10월</th>
              <th style={{ width: 42 }}>11월</th>
              <th style={{ width: 42 }}>12월</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                style={{
                  opacity: draggedIndex === index ? 0.5 : 1,
                  backgroundColor:
                    dragOverIndex === index && draggedIndex !== index
                      ? theme.vars.palette.action.hover
                      : 'transparent',
                  cursor: 'move',
                }}
              >
                {/* 순번 */}
                <td>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      fontSize: 14,
                    }}
                  >
                    {row.number || index + 1}
                  </Box>
                </td>
                {/* 교육구분 (라디오 버튼 - 법정) */}
                <td style={{ width: 56 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                    }}
                  >
                    <Radio
                      size="small"
                      color="default"
                      checked={row.educationType === '법정'}
                      onChange={() => onRowChange(index, 'educationType', '법정')}
                      sx={{ padding: '4px' }}
                    />
                  </Box>
                </td>
                {/* 교육구분 (라디오 버튼 - 자율) */}
                <td style={{ width: 56 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                    }}
                  >
                    <Radio
                      size="small"
                      color="default"
                      checked={row.educationType === '자율'}
                      onChange={() => onRowChange(index, 'educationType', '자율')}
                      sx={{ padding: '4px' }}
                    />
                  </Box>
                </td>
                {/* 교육과정 */}
                <td>
                  <TextField
                    size="small"
                    value={row.educationCourse || ''}
                    onChange={(e) => onRowChange(index, 'educationCourse', e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                {/* 일정 (1월~12월 체크박스) */}
                {MONTH_LABELS.map((_, monthIndex) => (
                  <td key={monthIndex}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Checkbox
                        size="small"
                        checked={row.scheduleMonths?.[monthIndex] || false}
                        onChange={(e) => {
                          const newMonths = [...(row.scheduleMonths || Array(12).fill(false))];
                          newMonths[monthIndex] = e.target.checked;
                          onRowChange(index, 'scheduleMonths', newMonths);
                        }}
                        sx={{
                          padding: '4px',
                        }}
                      />
                    </Box>
                  </td>
                ))}
                {/* 대상 인원(명) */}
                <td>
                  <TextField
                    size="small"
                    value={row.targetCount || ''}
                    onChange={(e) => onRowChange(index, 'targetCount', e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                {/* 교육방법 (내·외부) */}
                <td>
                  <TextField
                    size="small"
                    value={row.educationMethod || ''}
                    onChange={(e) => onRowChange(index, 'educationMethod', e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                {/* 비고 */}
                <td>
                  <TextField
                    size="small"
                    value={row.remark || ''}
                    onChange={(e) => onRowChange(index, 'remark', e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: 14,
                        height: 'auto',
                      },
                    }}
                  />
                </td>
                {/* 이동 */}
                <td>
                  <Box sx={{ display: 'flex', justifyContent: 'center', px: 1 }}>
                    <IconButton
                      size="small"
                      sx={{
                        cursor: 'grab',
                        '&:active': {
                          cursor: 'grabbing',
                        },
                      }}
                    >
                      <Iconify icon="eva:more-vertical-fill" width={20} />
                    </IconButton>
                  </Box>
                </td>
                {/* 삭제 */}
                <td>
                  <Box sx={{ display: 'flex', justifyContent: 'center', px: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => onRowDelete(index)}
                      sx={{
                        bgcolor: 'error.main',
                        color: 'error.contrastText',
                        minHeight: 30,
                        fontSize: 13,
                        fontWeight: 700,
                        px: 1,
                        py: 0.5,
                        '&:hover': {
                          bgcolor: 'error.dark',
                        },
                      }}
                    >
                      삭제
                    </Button>
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 5 }}>
        <Button
          variant="outlined"
          size="medium"
          onClick={onAddRow}
          startIcon={<Iconify icon="mingcute:add-line" width={20} />}
          sx={{
            minHeight: 36,
            fontSize: 14,
            fontWeight: 700,
            px: 1.5,
            py: 0.75,
          }}
        >
          항목추가
        </Button>
      </Box>

      {/* 교육대상별·교육유형별 최저 교육시간 테이블 */}
      <Box sx={{ width: '100%', mt: 5 }}>
        <Box sx={{ pb: 2, fontSize: 16, fontWeight: 600, px: 1 }}>
          [교육대상별·교육유형별 최저 교육시간]
        </Box>
        <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
          <Box component="table" sx={tableStyle}>
            <thead>
              <tr style={{ height: 60 }}>
                <th style={{ width: 239 }} colSpan={2} rowSpan={2}>
                  구분
                </th>
                <th style={{ width: 239 }}>신규교육</th>
                <th style={{ width: 239 }}>정기교육/보수교육</th>
                <th style={{ width: 239 }}>작업내용변경시(1회)</th>
                <th style={{ width: 263 }}>특별교육(채용시1회)</th>
              </tr>
            </thead>
            <tbody>
              {minimumEducationRows.map((row, index) => {
                const hasThirdRow = !!row.subCategory3;
                const rowSpan = hasThirdRow ? 3 : 2;

                return (
                  <>
                    {/* 첫 번째 행 */}
                    <tr key={`${index}-1`}>
                      {/* 구분 - 카테고리 */}
                      <td style={{ width: 119 }} rowSpan={rowSpan}>
                        <TextField
                          size="small"
                          value={row.category || ''}
                          onChange={(e) =>
                            onMinimumEducationRowChange(index, 'category', e.target.value)
                          }
                          fullWidth
                          placeholder="카테고리"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: 14,
                              height: 'auto',
                            },
                          }}
                        />
                      </td>
                      {/* 구분 - 세부 (위) */}
                      <td style={{ width: 120 }}>
                        <TextField
                          size="small"
                          value={row.subCategory1 || ''}
                          onChange={(e) =>
                            onMinimumEducationRowChange(index, 'subCategory1', e.target.value)
                          }
                          fullWidth
                          multiline
                          placeholder="세부"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: 14,
                              height: 'auto',
                            },
                          }}
                        />
                      </td>
                      {/* 신규교육 (위) */}
                      <td style={{ width: 239 }}>
                        <TextField
                          size="small"
                          value={row.newEmployeeEducation1 || ''}
                          onChange={(e) =>
                            onMinimumEducationRowChange(
                              index,
                              'newEmployeeEducation1',
                              e.target.value
                            )
                          }
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: 14,
                              height: 'auto',
                            },
                          }}
                        />
                      </td>
                      {/* 정기교육/보수교육 (위) */}
                      <td style={{ width: 239 }}>
                        <TextField
                          size="small"
                          value={row.regularEducation1 || ''}
                          onChange={(e) =>
                            onMinimumEducationRowChange(index, 'regularEducation1', e.target.value)
                          }
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: 14,
                              height: 'auto',
                            },
                          }}
                        />
                      </td>
                      {/* 작업내용변경시(1회) (위) */}
                      <td style={{ width: 239 }}>
                        <TextField
                          size="small"
                          value={row.workContentChange1 || ''}
                          onChange={(e) =>
                            onMinimumEducationRowChange(index, 'workContentChange1', e.target.value)
                          }
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: 14,
                              height: 'auto',
                            },
                          }}
                        />
                      </td>
                      {/* 특별교육(채용시1회) (위) */}
                      <td style={{ width: 263 }}>
                        <TextField
                          size="small"
                          value={row.specialEducation1 || ''}
                          onChange={(e) =>
                            onMinimumEducationRowChange(index, 'specialEducation1', e.target.value)
                          }
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: 14,
                              height: 'auto',
                            },
                          }}
                        />
                      </td>
                    </tr>
                    {/* 두 번째 행 (세부 아래) */}
                    <tr key={`${index}-2`}>
                      {/* 구분 - 세부 (아래) */}
                      <td style={{ width: 120 }}>
                        <TextField
                          size="small"
                          value={row.subCategory2 || ''}
                          onChange={(e) =>
                            onMinimumEducationRowChange(index, 'subCategory2', e.target.value)
                          }
                          fullWidth
                          multiline
                          placeholder="세부"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: 14,
                              height: 'auto',
                            },
                          }}
                        />
                      </td>
                      {/* 신규교육 (아래) */}
                      <td style={{ width: 239 }}>
                        <TextField
                          size="small"
                          value={row.newEmployeeEducation2 || ''}
                          onChange={(e) =>
                            onMinimumEducationRowChange(
                              index,
                              'newEmployeeEducation2',
                              e.target.value
                            )
                          }
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: 14,
                              height: 'auto',
                            },
                          }}
                        />
                      </td>
                      {/* 정기교육/보수교육 (아래) */}
                      <td style={{ width: 239 }}>
                        <TextField
                          size="small"
                          value={row.regularEducation2 || ''}
                          onChange={(e) =>
                            onMinimumEducationRowChange(index, 'regularEducation2', e.target.value)
                          }
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: 14,
                              height: 'auto',
                            },
                          }}
                        />
                      </td>
                      {/* 작업내용변경시(1회) (아래) */}
                      <td style={{ width: 239 }}>
                        <TextField
                          size="small"
                          value={row.workContentChange2 || ''}
                          onChange={(e) =>
                            onMinimumEducationRowChange(index, 'workContentChange2', e.target.value)
                          }
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: 14,
                              height: 'auto',
                            },
                          }}
                        />
                      </td>
                      {/* 특별교육(채용시1회) (아래) */}
                      <td style={{ width: 263 }}>
                        <TextField
                          size="small"
                          value={row.specialEducation2 || ''}
                          onChange={(e) =>
                            onMinimumEducationRowChange(index, 'specialEducation2', e.target.value)
                          }
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: 14,
                              height: 'auto',
                            },
                          }}
                        />
                      </td>
                    </tr>
                    {/* 세 번째 행 (subCategory3가 있을 때만 표시) */}
                    {hasThirdRow && (
                      <tr key={`${index}-3`}>
                        {/* 구분 - 세부 (3번째) */}
                        <td style={{ width: 120 }}>
                          <TextField
                            size="small"
                            value={row.subCategory3 || ''}
                            onChange={(e) =>
                              onMinimumEducationRowChange(index, 'subCategory3', e.target.value)
                            }
                            fullWidth
                            multiline
                            placeholder="세부"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                fontSize: 14,
                                height: 'auto',
                              },
                            }}
                          />
                        </td>
                        {/* 신규교육 (3번째) */}
                        <td style={{ width: 239 }}>
                          <TextField
                            size="small"
                            value={row.newEmployeeEducation3 || ''}
                            onChange={(e) =>
                              onMinimumEducationRowChange(
                                index,
                                'newEmployeeEducation3',
                                e.target.value
                              )
                            }
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                fontSize: 14,
                                height: 'auto',
                              },
                            }}
                          />
                        </td>
                        {/* 정기교육/보수교육 (3번째) */}
                        <td style={{ width: 239 }}>
                          <TextField
                            size="small"
                            value={row.regularEducation3 || ''}
                            onChange={(e) =>
                              onMinimumEducationRowChange(
                                index,
                                'regularEducation3',
                                e.target.value
                              )
                            }
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                fontSize: 14,
                                height: 'auto',
                              },
                            }}
                          />
                        </td>
                        {/* 작업내용변경시(1회) (3번째) */}
                        <td style={{ width: 239 }}>
                          <TextField
                            size="small"
                            value={row.workContentChange3 || ''}
                            onChange={(e) =>
                              onMinimumEducationRowChange(
                                index,
                                'workContentChange3',
                                e.target.value
                              )
                            }
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                fontSize: 14,
                                height: 'auto',
                              },
                            }}
                          />
                        </td>
                        {/* 특별교육(채용시1회) (3번째) */}
                        <td style={{ width: 263 }}>
                          <TextField
                            size="small"
                            value={row.specialEducation3 || ''}
                            onChange={(e) =>
                              onMinimumEducationRowChange(
                                index,
                                'specialEducation3',
                                e.target.value
                              )
                            }
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                fontSize: 14,
                                height: 'auto',
                              },
                            }}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
