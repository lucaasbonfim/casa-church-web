import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Calendar,
  MessageSquare,
  Book,
  Activity,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import Loader from "../../components/Loader";
import { formatDate } from "../../utils/utils";
import {
  formatActivityDescription,
  formatActivityTime,
} from "../../utils/activityUtils";

import { findAllUsers } from "../../services/users/usersService";
import { findAllEvents } from "../../services/events/eventsService";
import { findAllPosts } from "../../services/posts/postsService";
import { findAllSermons } from "../../services/sermons/sermonsService";
import { getRecentActivities, getUpcomingEvents } from "../../services/admin/adminService";

export default function AdminDashboard() {
  const { data: usersData } = useQuery({
    queryKey: ["admin-users-count"],
    queryFn: () => findAllUsers({ page: 1, limit: 1 }),
  });

  const { data: eventsData } = useQuery({
    queryKey: ["admin-events-count"],
    queryFn: async () => {
      const response = await findAllEvents({ page: 1, limit: 100 });
      const today = new Date();
      const activeEvents =
        response.events?.filter((event) => new Date(event.endDate) >= today) || [];

      return {
        ...response,
        activeCount: activeEvents.length,
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
    queryFn: () => getRecentActivities({ limit: 5 }),
  });

  const { data: upcomingEvents, isLoading: loadingEvents } = useQuery({
    queryKey: ["admin-upcoming-events"],
    queryFn: () => getUpcomingEvents({ limit: 5 }),
  });

  const stats = [
    {
      title: "Total de Usuarios",
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
      title: "Sermoes",
      value: sermonsData?.total || "0",
      icon: Book,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  const getActivityIcon = (action) => {
    switch (action?.toUpperCase()) {
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

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-white/60">Visao geral do sistema</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className={`${stat.bgColor} ${stat.color} rounded-lg p-3`}>
                    <Icon size={24} />
                  </div>
                </div>
                <h3 className="mb-1 text-2xl font-bold">{stat.value}</h3>
                <p className="text-sm text-white/60">{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Activity size={20} className="text-white/60" />
                <h2 className="text-xl font-bold">Atividades Recentes</h2>
              </div>
              <Link
                to="/admin/atividades"
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                Ver mais
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-4">
              {loadingActivities ? (
                <div className="flex justify-center py-8">
                  <Loader size={20} />
                </div>
              ) : activities?.activities?.length > 0 ? (
                activities.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-white/5"
                  >
                    <div className="mt-1">{getActivityIcon(activity.action)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white/90">
                        {formatActivityDescription(activity)}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        {formatActivityTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-white/40">
                  <p className="text-sm">Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center gap-3">
              <Calendar size={20} className="text-white/60" />
              <h2 className="text-xl font-bold">Proximos Eventos</h2>
            </div>
            <div className="space-y-4">
              {loadingEvents ? (
                <div className="flex justify-center py-8">
                  <Loader size={20} />
                </div>
              ) : upcomingEvents?.events?.length > 0 ? (
                upcomingEvents.events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border border-white/5 p-3 transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-white/90">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <Calendar size={12} />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        {event.location && (
                          <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
                            <MapPin size={12} />
                            <span className="line-clamp-1">{event.location.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-white/40">
                  <p className="text-sm">Nenhum evento proximo</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
