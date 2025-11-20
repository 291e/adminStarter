import { useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';

import { Iconify } from 'src/components/iconify';

import type {
  Table1200NearMissRow,
  Table1200RiskGrade,
  InvestigationTeamMember,
} from '../../types/table-data';
import ImageUploadModal from './modal/ImageUploadModal';
import InvestigationTeamSelectModal from './modal/InvestigationTeamSelectModal';

// ----------------------------------------------------------------------

type Props = {
  row: Table1200NearMissRow;
  onRowChange: (field: keyof Table1200NearMissRow, value: any) => void;
};

const gradeOptions: { value: Table1200RiskGrade; label: string }[] = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
];

const gradeGuideRows = [
  {
    grade: 'A',
    risk: '중대재해가 예상되는 경우',
    action: [
      '중단 여부와 관계없이 중대재해로 동일시',
      '조업 중단 후 사고조사 및 재발방지 대책 수립',
    ],
  },
  {
    grade: 'B',
    risk: '재해 사고 발생 징후 또는 신체·설비에 부상을 유발할 징조가 예측되는 경우',
    action: ['사고 발생 여부와 관계없이 동일시', '임시 조치를 포함해 즉시 개선 조치 시행'],
  },
  {
    grade: 'C',
    risk: '재해 사고 발생 가능성은 낮으나 설비·현장 상황상 예방 조치가 필요한 경우',
    action: ['일부 단위 작업은 가능하나, 교육 시행 등 예방 관리 조치 수행'],
  },
];

export default function Table1200NearMissForm({ row, onRowChange }: Props) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReporterModalOpen, setIsReporterModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    textAlign: 'left',
    verticalAlign: 'middle',
  };

  const handleRowChange =
    (field: keyof Table1200NearMissRow) => (event: React.ChangeEvent<HTMLInputElement>) =>
      onRowChange(field, event.target.value);

  const handleSelectChange =
    (field: keyof Table1200NearMissRow) => (event: React.ChangeEvent<HTMLInputElement>) =>
      onRowChange(field, event.target.value as Table1200RiskGrade);

  const handleReporterSearch = () => {
    setIsReporterModalOpen(true);
  };

  const handleReporterModalClose = () => {
    setIsReporterModalOpen(false);
  };

  const handleReporterModalConfirm = (members: InvestigationTeamMember[]) => {
    const selected = members[0];
    if (selected) {
      onRowChange('reporter', selected.name);
      onRowChange('reporterDepartment', selected.department);
    }
    setIsReporterModalOpen(false);
  };

  const handleAddImages = (files?: FileList | File[]) => {
    if (!files) return;
    const nextFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (!nextFiles.length) return;
    onRowChange('siteImages', [...row.siteImages, ...nextFiles]);
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

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleAddImages(event.target.files || undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadModalClose = () => {
    setIsUploadModalOpen(false);
  };

  const handleUploadModalConfirm = (images: File[]) => {
    onRowChange('siteImages', images);
    setIsUploadModalOpen(false);
  };

  const handleRemoveImage = (index: number) => {
    const nextImages = row.siteImages.filter((_, i) => i !== index);
    onRowChange('siteImages', nextImages);
  };

  const handleRemoveAllImages = () => {
    onRowChange('siteImages', []);
  };

  useEffect(() => {
    const urls = row.siteImages.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [row.siteImages]);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box
        component="table"
        sx={{
          width: '100%',
          border: '2px solid #1c252e',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
        }}
      >
        <colgroup>
          <col style={{ width: '154px' }} />
          <col />
          <col style={{ width: '160px' }} />
          <col style={{ width: '200px' }} />
        </colgroup>
        <tbody>
          <tr>
            <th style={headerCellStyle}>작업명</th>
            <td style={bodyCellStyle} colSpan={3}>
              <TextField
                size="small"
                fullWidth
                value={row.workName}
                onChange={handleRowChange('workName')}
                placeholder="작업명을 입력하세요."
              />
            </td>
            <th style={headerCellStyle}>등급</th>
            <td style={bodyCellStyle}>
              <TextField
                select
                size="small"
                fullWidth
                value={row.grade}
                onChange={handleSelectChange('grade')}
              >
                {gradeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </td>
          </tr>

          <tr>
            <th style={headerCellStyle}>신고자</th>
            <td style={bodyCellStyle} colSpan={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  value={row.reporter}
                  onChange={handleRowChange('reporter')}
                  placeholder="신고자를 입력하세요."
                />
                <IconButton
                  color="inherit"
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                  onClick={handleReporterSearch}
                >
                  <Iconify icon="eva:search-fill" />
                </IconButton>
              </Box>
            </td>
            <th style={headerCellStyle}>소속</th>
            <td style={bodyCellStyle}>
              <TextField
                size="small"
                fullWidth
                value={row.reporterDepartment}
                onChange={handleRowChange('reporterDepartment')}
                placeholder="소속을 입력하세요."
              />
            </td>
          </tr>

          <tr>
            <th style={headerCellStyle}>작업내용</th>
            <td style={{ ...bodyCellStyle }} colSpan={5}>
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={2}
                value={row.workContent}
                onChange={handleRowChange('workContent')}
                placeholder="작업내용을 입력하세요."
              />
            </td>
          </tr>

          <tr>
            <th style={headerCellStyle}>사고내용</th>
            <td style={bodyCellStyle} colSpan={4}>
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={2}
                value={row.accidentContent}
                onChange={handleRowChange('accidentContent')}
                placeholder="사고 내용을 입력하세요."
              />
            </td>
            <td style={bodyCellStyle}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2" component="span" sx={{ fontWeight: 600 }}>
                  위험정도
                </Typography>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={row.accidentRiskLevel}
                  onChange={handleSelectChange('accidentRiskLevel')}
                >
                  {gradeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </td>
          </tr>

          <tr>
            <th style={headerCellStyle}>발생원인</th>
            <td style={bodyCellStyle} colSpan={5}>
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={2}
                value={row.accidentCause}
                onChange={handleRowChange('accidentCause')}
                placeholder="발생 원인을 입력하세요."
              />
            </td>
          </tr>

          <tr>
            <th style={headerCellStyle}>예방대책(조치내용)</th>
            <td style={bodyCellStyle} colSpan={4}>
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={2}
                value={row.preventionMeasure}
                onChange={handleRowChange('preventionMeasure')}
                placeholder="예방 대책을 입력하세요."
              />
            </td>
            <td style={bodyCellStyle}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2" component="span" sx={{ fontWeight: 600 }}>
                  위험정도
                </Typography>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={row.preventionRiskLevel}
                  onChange={handleSelectChange('preventionRiskLevel')}
                >
                  {gradeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </td>
          </tr>

          <tr>
            <th style={headerCellStyle}>
              작업현장 상황 설명
              <br />
              (사진, 도면)
            </th>
            <td style={bodyCellStyle} colSpan={5}>
              <Stack spacing={2}>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  minRows={3}
                  value={row.siteSituation}
                  onChange={handleRowChange('siteSituation')}
                  placeholder="작업현장 상황을 설명하세요."
                />

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
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {imagePreviewUrls.map((url, index) => (
                        <Box
                          key={url}
                          sx={{
                            width: 96,
                            height: 96,
                            borderRadius: 2,
                            overflow: 'hidden',
                            position: 'relative',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Box
                            component="img"
                            src={url}
                            alt={`현장 이미지 ${index + 1}`}
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

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        onClick={handleRemoveAllImages}
                        disabled={row.siteImages.length === 0}
                      >
                        모두 제거
                      </Button>
                      <Button variant="contained" color="inherit" onClick={handleOpenUploadModal}>
                        업로드
                      </Button>
                    </Stack>
                  </Stack>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileInputChange}
                />
              </Stack>
            </td>
          </tr>
        </tbody>
      </Box>

      <Box
        component="table"
        sx={{
          width: '100%',
          border: '1px solid',
          borderColor: 'divider',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr>
            <th style={headerCellStyle}>등급</th>
            <th style={headerCellStyle}>위험정도</th>
            <th style={headerCellStyle}>조치</th>
          </tr>
        </thead>
        <tbody>
          {gradeGuideRows.map((rowItem) => (
            <tr key={rowItem.grade}>
              <td style={bodyCellStyle}>{rowItem.grade}</td>
              <td style={bodyCellStyle}>{rowItem.risk}</td>
              <td style={bodyCellStyle}>
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  {rowItem.action.map((action) => (
                    <li key={action} style={{ marginBottom: 4 }}>
                      {action}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          *중상: 한 곳 이상의 치명적인 저림을 필요로 하는 부상이나, 신체를 부분적으로 상실하거나 그
          기능을 장구적으로 상실한 경우
        </Typography>
        <Typography variant="body2" color="text.secondary">
          **경상: 사망에 이르지 않은 부상
        </Typography>
      </Box>
      <ImageUploadModal
        open={isUploadModalOpen}
        onClose={handleUploadModalClose}
        onConfirm={handleUploadModalConfirm}
        initialImages={row.siteImages}
      />
      <InvestigationTeamSelectModal
        open={isReporterModalOpen}
        onClose={handleReporterModalClose}
        onConfirm={handleReporterModalConfirm}
      />
    </Box>
  );
}
