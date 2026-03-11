import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useRiskReports } from 'src/sections/Operation/hooks/use-operation-api';
import type { RiskReport } from 'src/services/operation/operation.types';
import { CONFIG } from 'src/global-config';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (report: RiskReport) => void;
};

export default function RiskReportSelectModal({ open, onClose, onSelect }: Props) {
  const { data, isLoading, isError } = useRiskReports({
    page: 1,
    pageSize: 1000,
  });

  const riskReportList = ((data as any)?.body?.riskReportList || []) as RiskReport[];

  const getImageSrc = (report: RiskReport): string | null => {
    const rawImage =
      report.imageUrls && report.imageUrls.length > 0 ? report.imageUrls[0] : report.imageUrl;
    if (!rawImage) return null;
    if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
      return rawImage;
    }
    const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
    const path = rawImage.startsWith('/') ? rawImage : `/${rawImage}`;
    return `${baseUrl}${path}`;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>위험보고 목록</DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box sx={{ p: 3 }}>
            <Typography color="error.main">
              위험보고 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
            </Typography>
          </Box>
        ) : riskReportList.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary">조회된 위험보고가 없습니다.</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 80 }}>이미지</TableCell>
                  <TableCell sx={{ width: 180 }}>위치</TableCell>
                  <TableCell>내용</TableCell>
                  <TableCell sx={{ width: 120 }}>보고자</TableCell>
                  <TableCell sx={{ width: 150 }}>등록일</TableCell>
                  <TableCell sx={{ width: 100, textAlign: 'center' }}>선택</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {riskReportList.map((report) => {
                  const rowKey =
                    report.riskReportIdx !== undefined
                      ? String(report.riskReportIdx)
                      : String(report.id);
                  return (
                    <TableRow key={rowKey} hover>
                      <TableCell>
                        {getImageSrc(report) ? (
                          <Box
                            component="img"
                            src={getImageSrc(report) as string}
                            alt="위험보고 이미지"
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 1,
                              objectFit: 'cover',
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{report.location || '-'}</TableCell>
                      <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {report.content || '-'}
                      </TableCell>
                      <TableCell>{report.reporterName || '-'}</TableCell>
                      <TableCell>
                        {report.registeredAt ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                            <Typography variant="body2">
                              {dayjs(report.registeredAt).format('YYYY-MM-DD')}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {dayjs(report.registeredAt).format('HH:mm')}
                            </Typography>
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => onSelect(report)}
                          color="inherit"
                        >
                          적용
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}
