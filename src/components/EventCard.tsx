import { format } from 'date-fns';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    start_time: string;
  };
  onClick: (e: React.MouseEvent) => void;
}

const EventCard = ({ event, onClick }: EventCardProps) => {
  return (
    <div
      onClick={onClick}
      className="text-xs p-1.5 rounded bg-primary/10 hover:bg-primary/20 transition-smooth cursor-pointer border-l-2 border-primary"
    >
      <div className="font-medium text-primary truncate">{event.title}</div>
      <div className="text-muted-foreground">
        {format(new Date(event.start_time), 'h:mm a')}
      </div>
    </div>
  );
};

export default EventCard;
