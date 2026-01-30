import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';

import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  subheader?: string;
  list: ItemProps[];
};

type ItemProps = {
  id: string;
  title: string;
  type: string;
  time: Date;
};

export default function AdminRecentActivity({ title, subheader, list, ...other }: Props) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Timeline
        sx={{
          m: 0,
          p: 3,
          [`& .MuiTimelineItem-root:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {list.map((item, index) => (
          <ActivityItem key={item.id} item={item} lastItem={index === list.length - 1} />
        ))}
      </Timeline>
    </Card>
  );
}

// ----------------------------------------------------------------------

function ActivityItem({ item, lastItem }: { item: ItemProps; lastItem: boolean }) {
  const { type, title, time } = item;

  const color =
    (type === 'order1' && 'primary') ||
    (type === 'order2' && 'success') ||
    (type === 'order3' && 'info') ||
    (type === 'order4' && 'warning') ||
    'error';

  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot color={color as any} />
        {lastItem ? null : <TimelineConnector />}
      </TimelineSeparator>

      <TimelineContent>
        <Box sx={{ color: 'text.primary', typography: 'subtitle2' }}>{title}</Box>

        <Box sx={{ color: 'text.disabled', typography: 'caption', mt: 0.5 }}>{fDateTime(time)}</Box>
      </TimelineContent>
    </TimelineItem>
  );
}

import Box from '@mui/material/Box';
