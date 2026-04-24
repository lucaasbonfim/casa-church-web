import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Book,
  Activity,
  MapPin
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import AdminLayout from "../../components/AdminLayout";
import Loader from "../../components/Loader";
import { formatDate } from "../../utils/utils";

// Services
import { findAllUsers } from "../../services/users/usersService";
import { findAllEvents } from "../../services/events/eventsService";
import { findAllPosts } from "../../services/posts/postsService";
import { findAllSermons } from "../../services/sermons/sermonsService";
import { getRecentActivities, getUpcomingEvents } from "../../services/admin/adminService";

export default function AdminDashboard() {
  // Queries para buscar estatísticas
  const { data: usersData } = useQuery({
    queryKey: ["admin-users-count"],
    queryFn: () => findAllUsers({ page: 1, limit: 1 }),
  });

  // Busca TODOS os eventos para contar apenas os ativos
  const { data: eventsData } = useQuery({
    queryKey: ["admin-events-count"],
    queryFn: async () => {
      const response = await findAllEvents({ page: 1, limit: 100 });
      const today = new Date();
      
      // Conta apenas eventos que ainda não terminaram (endDate >= hoje)
      const activeEvents = response.events?.filter(event => {
        const eventEndDate = new Date(event.endDate);
        const isActive = eventEndDate >= today;
        return isActive;
      }) || [];
      
      return {
        ...response,
        activeCount: activeEvents.length,
        total: response.total
      };
    },
  });

  const { data: postsData } = useQuery({
    queryKey: ["admin-posts-count"],
    queryFn: () => findAllPosts({ page: 1, limit: 1 }),
  });

  const { data: sermonsData } = useQuery({
    queryKey: ["admin-sermons-count"],
    queryFn: () => findAllSermons({ page: 1, limit: 1 }),
  });

const { data: activities, isLoading: loadingActivities } = useQuery({
  queryKey: ["admin-activities"],
  queryFn: async () => {
    // ⬆️ busca MAIS registros
    const result = await getRecentActivities({ limit: 50 });

    const BLOCKED_ACTIONS = ["GET", "READ", "VIEW"];

    const filteredActivities =
      result.activities?.filter(activity =>
        !BLOCKED_ACTIONS.includes(
          activity.action?.toUpperCase()
        )
      ) || [];

    return {
      ...result,
      // ⬇️ só os 5 primeiros relevantes
      activities: filteredActivities.slice(0, 5),
    };
  },
});




  const { data: upcomingEvents, isLoading: loadingEvents } = useQuery({
    queryKey: ["admin-upcoming-events"],
    queryFn: async () => {
      const result = await getUpcomingEvents({ limit: 5 });
      return result;
    },
  });

  const stats = [
    {
      title: "Total de Usuários",
      value: usersData?.total || "0",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Eventos Ativos",
      value: eventsData?.activeCount || "0",
      icon: Calendar,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Posts",
      value: postsData?.total || "0",
      icon: MessageSquare,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Sermões",
      value: sermonsData?.total || "0",
      icon: Book,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  const getActivityIcon = (action) => {
    const actionUpper = action?.toUpperCase();
    switch (actionUpper) {
      case "POST":
        return <Activity size={16} className="text-green-500" />;
      case "GET":
        return <Activity size={16} className="text-blue-500" />;
      case "DELETE":
        return <Activity size={16} className="text-red-500" />;
      case "PATCH":
      case "PUT":
        return <Activity size={16} className="text-yellow-500" />;
      default:
        return <Activity size={16} className="text-white/60" />;
    }
  };

  const formatActivityTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return "há algum tempo";
    }
  };

  const formatActivityDescription = (activity) => {
    const action = activity.action?.toUpperCase();
    const endpoint = activity.endpoint?.replace(/^\//, '');
    
    // Busca o nome do usuário
    const user = usersData?.users?.find(u => u.id === activity.userId);
    const userName = user?.name || 'Usuário';
    
  
    const actionMap = {
      'POST': 'criou',
      'GET': 'visualizou',
      'DELETE': 'deletou',
      'PATCH': 'atualizou',
      'PUT': 'atualizou'
    };
    
    const endpointMap = {
      'events': 'eventos',
      'posts': 'posts',
      'users': 'usuários',
      'sermons': 'sermões',
      'lessons': 'lições',
      'comments': 'comentários',
      'likes': 'curtidas',
      'locations': 'locais',
      'church-houses': 'CIs',
      'user-activity': 'atividades'
    };
    
    const translatedEndpoint = endpointMap[endpoint] || endpoint;
    const actionVerb = actionMap[action] || action;
    
    return `${userName} ${actionVerb} ${translatedEndpoint}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-white/60">Visão geral do sistema</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                    <Icon size={24} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <p className="text-white/60 text-sm">{stat.title}</p>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Atividades Recentes */}
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity size={20} className="text-white/60" />
              <h2 className="text-xl font-bold">Atividades Recentes</h2>
            </div>
            <div className="space-y-4">
              {loadingActivities ? (
                <div className="flex justify-center py-8">
                  <Loader size={20} />
                </div>
              ) : activities?.activities && activities.activities.length > 0 ? (
                activities.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="mt-1">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/90">
                        {formatActivityDescription(activity)}
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        {formatActivityTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-white/40 py-8">
                  <p className="text-sm">Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </div>

          {/* Próximos Eventos */}
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar size={20} className="text-white/60" />
              <h2 className="text-xl font-bold">Próximos Eventos</h2>
            </div>
            <div className="space-y-4">
              {loadingEvents ? (
                <div className="flex justify-center py-8">
                  <Loader size={20} />
                </div>
              ) : upcomingEvents?.events && upcomingEvents.events.length > 0 ? (
                upcomingEvents.events.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg hover:bg-white/5 transition-colors border border-white/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white/90 mb-1 line-clamp-1">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <Calendar size={12} />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                            <MapPin size={12} />
                            <span className="line-clamp-1">{event.location.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-white/40 py-8">
                  <p className="text-sm">Nenhum evento próximo</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
