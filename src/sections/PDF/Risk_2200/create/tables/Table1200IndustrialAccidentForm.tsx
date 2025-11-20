import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { type Dayjs } from 'dayjs';

import { Iconify } from 'src/components/iconify';
import type {
  Table1200IndustrialAccidentRow,
  InvestigationTeamMember,
  HumanDamage,
} from '../../types/table-data';
import InvestigationTeamSelectModal from './modal/InvestigationTeamSelectModal';
import ImageUploadModal from './modal/ImageUploadModal';

// ----------------------------------------------------------------------

type Props = {
  row: Table1200IndustrialAccidentRow;
  onRowChange: (field: keyof Table1200IndustrialAccidentRow, value: any) => void;
  onInvestigationTeamAdd: (member: InvestigationTeamMember) => void;
  onInvestigationTeamDelete: (index: number) => void;
  onInvestigationTeamMove: (fromIndex: number, toIndex: number) => void;
  onHumanDamageAdd: (damage: HumanDamage) => void;
  onHumanDamageDelete: (index: number) => void;
  onHumanDamageMove: (fromIndex: number, toIndex: number) => void;
};

export default function Table1200IndustrialAccidentForm({
  row,
  onRowChange,
  onInvestigationTeamAdd,
  onInvestigationTeamDelete,
  onInvestigationTeamMove,
  onHumanDamageAdd,
  onHumanDamageDelete,
  onHumanDamageMove,
}: Props) {
  const theme = useTheme();
  const [selectModalMode, setSelectModalMode] = useState<'investigation' | 'humanDamage' | null>(
    null
  );
  const [isDragActive, setIsDragActive] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedInvestigationIndex, setDraggedInvestigationIndex] = useState<number | null>(null);
  const [draggedHumanDamageIndex, setDraggedHumanDamageIndex] = useState<number | null>(null);
  const [dragOverInvestigationIndex, setDragOverInvestigationIndex] = useState<number | null>(null);
  const [dragOverHumanDamageIndex, setDragOverHumanDamageIndex] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleInvestigationDragStart = (index: number) => {
    setDraggedInvestigationIndex(index);
  };

  const handleInvestigationDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedInvestigationIndex !== null && draggedInvestigationIndex !== index) {
      setDragOverInvestigationIndex(index);
    }
  };

  const handleInvestigationDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedInvestigationIndex !== null && draggedInvestigationIndex !== dropIndex) {
      onInvestigationTeamMove(draggedInvestigationIndex, dropIndex);
    }
    setDraggedInvestigationIndex(null);
    setDragOverInvestigationIndex(null);
  };

  const handleHumanDamageDragStart = (index: number) => {
    setDraggedHumanDamageIndex(index);
  };

  const handleHumanDamageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedHumanDamageIndex !== null && draggedHumanDamageIndex !== index) {
      setDragOverHumanDamageIndex(index);
    }
  };

  const handleHumanDamageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedHumanDamageIndex !== null && draggedHumanDamageIndex !== dropIndex) {
      onHumanDamageMove(draggedHumanDamageIndex, dropIndex);
    }
    setDraggedHumanDamageIndex(null);
    setDragOverHumanDamageIndex(null);
  };

  // 공통 스타일
  const headerCellStyle: React.CSSProperties = {
    backgroundColor: '#f4f6f8',
    padding: '8px',
    border: '1px solid #1c252e',
    textAlign: 'center',
    verticalAlign: 'middle',
    fontSize: 16,
    fontWeight: 600,
    lineHeight: '24px',
  };

  const bodyCellStyle: React.CSSProperties = {
    padding: '8px',
    border: '1px solid #1c252e',
    textAlign: 'center',
    verticalAlign: 'middle',
  };

  const subHeaderCellStyle: React.CSSProperties = {
    backgroundColor: '#fafafa',
    padding: '8px',
    border: '1px solid #1c252e',
    borderTop: 'none',
    textAlign: 'center',
    verticalAlign: 'middle',
    fontSize: 16,
    fontWeight: 600,
    lineHeight: '24px',
  };

  const hasInvestigationMembers = row.investigationTeam.length > 0;
  const displayedInvestigationTeam = hasInvestigationMembers
    ? row.investigationTeam
    : [{ department: '', name: '' }];

  const innerCellStyle: React.CSSProperties = {
    border: '1px solid #dfe3e8',
  };

  const hasHumanDamage = row.humanDamage.length > 0;
  const displayedHumanDamage = hasHumanDamage
    ? row.humanDamage
    : [{ department: '', name: '', position: '', injury: '' }];

  const handleAddImages = (files?: FileList | File[]) => {
    if (!files) return;
    const nextFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (!nextFiles.length) return;
    onRowChange('investigationImages', [...row.investigationImages, ...nextFiles]);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleAddImages(event.target.files || undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDropImages = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    handleAddImages(event.dataTransfer.files);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const handleRemoveImage = (index: number) => {
    const nextImages = row.investigationImages.filter((_, i) => i !== index);
    onRowChange('investigationImages', nextImages);
  };

  const handleRemoveAllImages = () => {
    onRowChange('investigationImages', []);
  };

  const handleUploadButtonClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadModalClose = () => {
    setIsUploadModalOpen(false);
  };

  const handleUploadModalConfirm = (images: File[]) => {
    onRowChange('investigationImages', images);
    setIsUploadModalOpen(false);
  };

  useEffect(() => {
    const urls = row.investigationImages.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [row.investigationImages]);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
        <table
          style={{
            width: '100%',
            border: '2px solid #1c252e',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
        >
          <colgroup>
            <col style={{ width: '154px' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: '160px' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: 'auto' }} />
          </colgroup>
          <tbody>
            {/* 사고명, 사고 일시 */}
            <tr>
              <th style={{ ...headerCellStyle, width: '154px' }}>사고명</th>
              <td colSpan={4} style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.accidentName}
                  onChange={(e) => onRowChange('accidentName', e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                    },
                  }}
                />
              </td>
              <th style={{ ...headerCellStyle, width: '160px' }}>사고 일시</th>
              <td style={{ ...bodyCellStyle, width: '160px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <DatePicker
                    value={row.accidentDate ? dayjs(row.accidentDate) : null}
                    onChange={(newValue: Dayjs | null) =>
                      onRowChange('accidentDate', newValue?.format('YYYY-MM-DD') || '')
                    }
                    format="YYYY-MM-DD"
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        label: '날짜',
                        placeholder: 'YYYY- MM- DD',
                      },
                    }}
                  />
                  <TimePicker
                    value={row.accidentTime ? dayjs(row.accidentTime, 'HH:mm') : null}
                    onChange={(newValue: Dayjs | null) =>
                      onRowChange('accidentTime', newValue?.format('HH:mm') || '')
                    }
                    format="HH:mm"
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        label: '시간',
                        placeholder: 'hh: mm',
                      },
                    }}
                  />
                </Box>
              </td>
            </tr>

            {/* 사고장소, 사고 형태 */}
            <tr>
              <th style={headerCellStyle}>사고장소</th>
              <td colSpan={4} style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.accidentLocation}
                  onChange={(e) => onRowChange('accidentLocation', e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                    },
                  }}
                />
              </td>
              <th style={headerCellStyle}>사고 형태</th>
              <td style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.accidentType}
                  onChange={(e) => onRowChange('accidentType', e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                    },
                  }}
                />
              </td>
            </tr>

            {/* 사고조사반 */}
            <tr>
              <th style={headerCellStyle}>
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}
                >
                  <Iconify icon="eva:search-fill" width={24} />
                  <Typography sx={{ fontSize: 16, fontWeight: 600 }}>사고조사반</Typography>
                </Box>
              </th>
              <td colSpan={6} style={{ padding: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      backgroundColor: '#f4f6f8',
                      textAlign: 'right',
                      borderBottom: '1px solid',
                      borderColor: 'text.primary',
                      p: 1,
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setSelectModalMode('investigation')}
                      sx={{
                        minHeight: 30,
                        fontSize: 13,
                        fontWeight: 700,
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      항목 추가
                    </Button>
                  </Box>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      border: '1px solid #dfe3e8',
                      borderTop: 'none',
                    }}
                  >
                    <colgroup>
                      <col style={{ width: '50%' }} />
                      <col style={{ width: '50%' }} />
                      <col style={{ minWidth: 100, maxWidth: 100 }} />
                      <col style={{ minWidth: 100, maxWidth: 100 }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>소속</th>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>성명</th>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>이동</th>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedInvestigationTeam.map((member, index) => {
                        const isPlaceholder = !hasInvestigationMembers;
                        return (
                          <tr
                            key={index}
                            draggable
                            onDragStart={() =>
                              !isPlaceholder && handleInvestigationDragStart(index)
                            }
                            onDragOver={(e) =>
                              !isPlaceholder && handleInvestigationDragOver(e, index)
                            }
                            onDrop={(e) => !isPlaceholder && handleInvestigationDrop(e, index)}
                            onDragEnd={() => {
                              setDraggedInvestigationIndex(null);
                              setDragOverInvestigationIndex(null);
                            }}
                            style={{
                              opacity: draggedInvestigationIndex === index ? 0.5 : 1,
                              backgroundColor:
                                dragOverInvestigationIndex === index &&
                                draggedInvestigationIndex !== index
                                  ? theme.vars.palette.action.hover
                                  : 'transparent',
                              cursor: isPlaceholder ? 'default' : 'move',
                            }}
                          >
                            <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                              <TextField
                                size="small"
                                value={isPlaceholder ? '' : member.department}
                                onChange={
                                  isPlaceholder
                                    ? undefined
                                    : (e) => {
                                        const newTeam = [...row.investigationTeam];
                                        newTeam[index] = { ...member, department: e.target.value };
                                        onRowChange('investigationTeam', newTeam);
                                      }
                                }
                                fullWidth
                                disabled={isPlaceholder}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    fontSize: 15,
                                    height: 'auto',
                                  },
                                }}
                              />
                            </td>
                            <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                              <TextField
                                size="small"
                                value={isPlaceholder ? '' : member.name}
                                onChange={
                                  isPlaceholder
                                    ? undefined
                                    : (e) => {
                                        const newTeam = [...row.investigationTeam];
                                        newTeam[index] = { ...member, name: e.target.value };
                                        onRowChange('investigationTeam', newTeam);
                                      }
                                }
                                fullWidth
                                disabled={isPlaceholder}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    fontSize: 15,
                                    height: 'auto',
                                  },
                                }}
                              />
                            </td>
                            <td
                              style={{
                                ...bodyCellStyle,
                                padding: 0,
                                ...innerCellStyle,
                                minWidth: 100,
                                maxWidth: 100,
                              }}
                            >
                              <Box
                                sx={{
                                  p: 1,
                                  display: 'flex',
                                  justifyContent: 'center',
                                  minWidth: 100,
                                  maxWidth: 100,
                                }}
                              >
                                <IconButton
                                  size="small"
                                  sx={{
                                    p: 0.625,
                                    cursor: isPlaceholder ? 'default' : 'grab',
                                    '&:active': {
                                      cursor: 'grabbing',
                                    },
                                  }}
                                  disabled={isPlaceholder}
                                >
                                  <Iconify icon="custom:drag-dots-fill" width={20} />
                                </IconButton>
                              </Box>
                            </td>
                            <td
                              style={{
                                ...bodyCellStyle,
                                padding: 0,
                                ...innerCellStyle,
                                minWidth: 100,
                                maxWidth: 100,
                              }}
                            >
                              <Box
                                sx={{
                                  p: 1,
                                  display: 'flex',
                                  justifyContent: 'center',
                                  minWidth: 100,
                                  maxWidth: 100,
                                }}
                              >
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => !isPlaceholder && onInvestigationTeamDelete(index)}
                                  sx={{
                                    minHeight: 30,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    px: 1,
                                    py: 0.5,
                                    bgcolor: 'action.disabledBackground',
                                    color: 'action.disabled',
                                    '&:hover': {
                                      bgcolor: 'action.disabledBackground',
                                    },
                                  }}
                                  disabled={isPlaceholder}
                                >
                                  삭제
                                </Button>
                              </Box>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Box>
              </td>
            </tr>

            {/* 인적피해 */}
            <tr>
              <th style={headerCellStyle}>
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}
                >
                  <Iconify icon="eva:search-fill" width={24} />
                  <Typography sx={{ fontSize: 16, fontWeight: 600 }}>인적피해</Typography>
                </Box>
              </th>
              <td colSpan={6} style={{ padding: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      backgroundColor: '#f4f6f8',
                      textAlign: 'right',
                      borderBottom: '1px solid',
                      borderColor: 'text.primary',
                      p: 1,
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setSelectModalMode('humanDamage')}
                      sx={{
                        minHeight: 30,
                        fontSize: 13,
                        fontWeight: 700,
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      항목 추가
                    </Button>
                  </Box>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      border: '1px solid #dfe3e8',
                      borderTop: 'none',
                    }}
                  >
                    <colgroup>
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                      <col style={{ minWidth: 100, maxWidth: 100 }} />
                      <col style={{ minWidth: 100, maxWidth: 100 }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>소속</th>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>성명</th>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>직급</th>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>상해부위/부상</th>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>이동</th>
                        <th style={{ ...subHeaderCellStyle, ...innerCellStyle }}>삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedHumanDamage.map((damage, index) => {
                        const isPlaceholder = !hasHumanDamage;
                        return (
                          <tr
                            key={index}
                            draggable
                            onDragStart={() => !isPlaceholder && handleHumanDamageDragStart(index)}
                            onDragOver={(e) =>
                              !isPlaceholder && handleHumanDamageDragOver(e, index)
                            }
                            onDrop={(e) => !isPlaceholder && handleHumanDamageDrop(e, index)}
                            onDragEnd={() => {
                              setDraggedHumanDamageIndex(null);
                              setDragOverHumanDamageIndex(null);
                            }}
                            style={{
                              opacity: draggedHumanDamageIndex === index ? 0.5 : 1,
                              backgroundColor:
                                dragOverHumanDamageIndex === index &&
                                draggedHumanDamageIndex !== index
                                  ? theme.vars.palette.action.hover
                                  : 'transparent',
                              cursor: isPlaceholder ? 'default' : 'move',
                            }}
                          >
                            <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                              <TextField
                                size="small"
                                value={isPlaceholder ? '' : damage.department}
                                onChange={
                                  isPlaceholder
                                    ? undefined
                                    : (e) => {
                                        const newDamage = [...row.humanDamage];
                                        newDamage[index] = {
                                          ...damage,
                                          department: e.target.value,
                                        };
                                        onRowChange('humanDamage', newDamage);
                                      }
                                }
                                fullWidth
                                disabled={isPlaceholder}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    fontSize: 15,
                                    height: 'auto',
                                  },
                                }}
                              />
                            </td>
                            <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                              <TextField
                                size="small"
                                value={isPlaceholder ? '' : damage.name}
                                onChange={
                                  isPlaceholder
                                    ? undefined
                                    : (e) => {
                                        const newDamage = [...row.humanDamage];
                                        newDamage[index] = { ...damage, name: e.target.value };
                                        onRowChange('humanDamage', newDamage);
                                      }
                                }
                                fullWidth
                                disabled={isPlaceholder}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    fontSize: 15,
                                    height: 'auto',
                                  },
                                }}
                              />
                            </td>
                            <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                              <TextField
                                size="small"
                                value={isPlaceholder ? '' : damage.position}
                                onChange={
                                  isPlaceholder
                                    ? undefined
                                    : (e) => {
                                        const newDamage = [...row.humanDamage];
                                        newDamage[index] = { ...damage, position: e.target.value };
                                        onRowChange('humanDamage', newDamage);
                                      }
                                }
                                fullWidth
                                disabled={isPlaceholder}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    fontSize: 15,
                                    height: 'auto',
                                  },
                                }}
                              />
                            </td>
                            <td style={{ ...bodyCellStyle, padding: 8, ...innerCellStyle }}>
                              <TextField
                                size="small"
                                value={isPlaceholder ? '' : damage.injury}
                                onChange={
                                  isPlaceholder
                                    ? undefined
                                    : (e) => {
                                        const newDamage = [...row.humanDamage];
                                        newDamage[index] = { ...damage, injury: e.target.value };
                                        onRowChange('humanDamage', newDamage);
                                      }
                                }
                                fullWidth
                                disabled={isPlaceholder}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    fontSize: 15,
                                    height: 'auto',
                                  },
                                }}
                              />
                            </td>
                            <td
                              style={{
                                ...bodyCellStyle,
                                padding: 0,
                                ...innerCellStyle,
                                width: 100,
                              }}
                            >
                              <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                                <IconButton
                                  size="small"
                                  sx={{
                                    p: 0.625,
                                    cursor: isPlaceholder ? 'default' : 'grab',
                                    '&:active': {
                                      cursor: 'grabbing',
                                    },
                                  }}
                                  disabled={isPlaceholder}
                                >
                                  <Iconify icon="custom:drag-dots-fill" width={20} />
                                </IconButton>
                              </Box>
                            </td>
                            <td
                              style={{
                                ...bodyCellStyle,
                                padding: 0,
                                ...innerCellStyle,
                                width: 100,
                              }}
                            >
                              <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => !isPlaceholder && onHumanDamageDelete(index)}
                                  sx={{
                                    minHeight: 30,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    px: 1,
                                    py: 0.5,
                                    bgcolor: 'action.disabledBackground',
                                    color: 'action.disabled',
                                    '&:hover': {
                                      bgcolor: 'action.disabledBackground',
                                    },
                                  }}
                                  disabled={isPlaceholder}
                                >
                                  삭제
                                </Button>
                              </Box>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Box>
              </td>
            </tr>

            {/* 물적피해 */}
            <tr>
              <th style={headerCellStyle}>물적피해</th>
              <td colSpan={6} style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.materialDamage}
                  onChange={(e) => onRowChange('materialDamage', e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                    },
                  }}
                />
              </td>
            </tr>

            {/* 사고내용 + 위험성 평가(사전) */}
            <tr>
              <th rowSpan={3} style={headerCellStyle}>
                사고내용
              </th>
              <td rowSpan={3} colSpan={3} style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.accidentContent}
                  onChange={(e) => onRowChange('accidentContent', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                    },
                  }}
                />
              </td>
              <th rowSpan={3} style={headerCellStyle}>
                위험성 평가
              </th>
              <td style={subHeaderCellStyle}>가능성</td>
              <td style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.riskAssessmentBefore.possibility}
                  onChange={(e) =>
                    onRowChange('riskAssessmentBefore', {
                      ...row.riskAssessmentBefore,
                      possibility: e.target.value,
                    })
                  }
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                    },
                  }}
                />
              </td>
            </tr>
            <tr>
              <td style={subHeaderCellStyle}>중대성</td>
              <td style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.riskAssessmentBefore.severity}
                  onChange={(e) =>
                    onRowChange('riskAssessmentBefore', {
                      ...row.riskAssessmentBefore,
                      severity: e.target.value,
                    })
                  }
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                    },
                  }}
                />
              </td>
            </tr>
            <tr>
              <td style={subHeaderCellStyle}>위험성</td>
              <td style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.riskAssessmentBefore.risk}
                  onChange={(e) =>
                    onRowChange('riskAssessmentBefore', {
                      ...row.riskAssessmentBefore,
                      risk: e.target.value,
                    })
                  }
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                    },
                  }}
                />
              </td>
            </tr>

            {/* 사고원인 */}
            <tr>
              <th style={headerCellStyle}>사고원인</th>
              <td colSpan={6} style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.accidentCause}
                  onChange={(e) => onRowChange('accidentCause', e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                    },
                  }}
                />
              </td>
            </tr>

            {/* 의사/외부 전문가 소견 */}
            <tr>
              <th style={headerCellStyle}>
                <Typography sx={{ fontSize: 16, fontWeight: 600, textAlign: 'center' }}>
                  의사/외부
                  <br />
                  전문가 소견
                </Typography>
              </th>
              <td colSpan={6} style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.doctorOpinion}
                  onChange={(e) => onRowChange('doctorOpinion', e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                    },
                  }}
                />
              </td>
            </tr>

            {/* 재발방지 대책 + 위험성 평가(사후) */}
            <tr>
              <th rowSpan={3} style={headerCellStyle}>
                재발방지 대책
              </th>
              <td rowSpan={3} colSpan={3} style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.preventionMeasure}
                  onChange={(e) => onRowChange('preventionMeasure', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                    },
                  }}
                />
              </td>
              <th rowSpan={3} style={headerCellStyle}>
                위험성 평가
              </th>
              <td style={subHeaderCellStyle}>가능성</td>
              <td style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.riskAssessmentAfter.possibility}
                  onChange={(e) =>
                    onRowChange('riskAssessmentAfter', {
                      ...row.riskAssessmentAfter,
                      possibility: e.target.value,
                    })
                  }
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                    },
                  }}
                />
              </td>
            </tr>
            <tr>
              <td style={subHeaderCellStyle}>중대성</td>
              <td style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.riskAssessmentAfter.severity}
                  onChange={(e) =>
                    onRowChange('riskAssessmentAfter', {
                      ...row.riskAssessmentAfter,
                      severity: e.target.value,
                    })
                  }
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                    },
                  }}
                />
              </td>
            </tr>
            <tr>
              <td style={subHeaderCellStyle}>위험성</td>
              <td style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.riskAssessmentAfter.risk}
                  onChange={(e) =>
                    onRowChange('riskAssessmentAfter', {
                      ...row.riskAssessmentAfter,
                      risk: e.target.value,
                    })
                  }
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                    },
                  }}
                />
              </td>
            </tr>

            {/* 기타내용 사고조사 내용 */}
            <tr>
              <th style={headerCellStyle}>
                <Typography sx={{ fontSize: 16, fontWeight: 600, textAlign: 'center' }}>
                  기타내용
                  <br />
                  사고조사 내용
                </Typography>
              </th>
              <td colSpan={6} style={bodyCellStyle}>
                <TextField
                  size="small"
                  value={row.otherContent}
                  onChange={(e) => onRowChange('otherContent', e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 15,
                      height: 'auto',
                    },
                  }}
                />
              </td>
            </tr>

            {/* 기타내용 사고조사 사진 */}
            <tr>
              <th style={headerCellStyle}>
                <Typography sx={{ fontSize: 16, fontWeight: 600, textAlign: 'center' }}>
                  기타내용
                  <br />
                  사고조사 사진
                </Typography>
              </th>
              <td colSpan={6} style={bodyCellStyle}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDropImages}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDragActive(true);
                    }}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    sx={{
                      border: '1px dashed',
                      borderColor: isDragActive ? 'primary.main' : 'divider',
                      bgcolor: isDragActive ? 'primary.lighter' : 'grey.50',
                      borderRadius: 2,
                      px: { xs: 2, sm: 4 },
                      py: { xs: 4, sm: 6 },
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Iconify
                      icon="eva:cloud-upload-fill"
                      width={64}
                      sx={{ color: 'primary.main', mb: 2 }}
                    />
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                      이미지 업로드
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      클릭하여 파일을 선택하거나 마우스로 드래그하여 옮겨주세요.
                    </Typography>
                  </Box>

                  {imagePreviewUrls.length > 0 && (
                    <>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {imagePreviewUrls.map((url, index) => (
                          <Box
                            key={url}
                            sx={{
                              width: 72,
                              height: 72,
                              borderRadius: 2,
                              overflow: 'hidden',
                              position: 'relative',
                            }}
                          >
                            <Box
                              component="img"
                              src={url}
                              alt={`사고조사 이미지 ${index + 1}`}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRemoveImage(index);
                              }}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'common.white',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                              }}
                            >
                              <Iconify icon="solar:close-circle-bold" width={16} />
                            </IconButton>
                          </Box>
                        ))}
                      </Stack>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                        <Button
                          variant="outlined"
                          onClick={handleRemoveAllImages}
                          disabled={row.investigationImages.length === 0}
                        >
                          모두 제거
                        </Button>
                        <Button
                          variant="contained"
                          color="inherit"
                          onClick={handleUploadButtonClick}
                          startIcon={<Iconify icon="eva:cloud-upload-fill" width={18} />}
                        >
                          업로드
                        </Button>
                      </Box>
                    </>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileInputChange}
                  />
                </Box>
              </td>
            </tr>
          </tbody>
        </table>
      </Box>

      {/* 모달들 */}
      <InvestigationTeamSelectModal
        open={selectModalMode !== null}
        onClose={() => setSelectModalMode(null)}
        onConfirm={(members) => {
          if (selectModalMode === 'investigation') {
            members.forEach((member) => onInvestigationTeamAdd(member));
          }
          if (selectModalMode === 'humanDamage') {
            members.forEach((member) =>
              onHumanDamageAdd({
                department: member.department,
                name: member.name,
                position: '',
                injury: '',
              })
            );
          }
          setSelectModalMode(null);
        }}
      />
      <ImageUploadModal
        open={isUploadModalOpen}
        onClose={handleUploadModalClose}
        onConfirm={handleUploadModalConfirm}
        initialImages={row.investigationImages}
      />
    </Box>
  );
}
