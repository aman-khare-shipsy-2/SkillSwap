import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestService } from '../../services/request.service';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';

const Requests = () => {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: () => requestService.getMyRequests(),
  });

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => requestService.acceptRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('Request accepted! Chat session created.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => requestService.rejectRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('Request rejected.');
    },
  });

  const forfeitMutation = useMutation({
    mutationFn: (requestId: string) => requestService.forfeitRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('Request forfeited.');
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-amber-100 text-amber-700', icon: FiClock },
      accepted: { color: 'bg-emerald-100 text-emerald-700', icon: FiCheck },
      rejected: { color: 'bg-red-100 text-red-700', icon: FiX },
      expired: { color: 'bg-slate-100 text-slate-700', icon: FiClock },
      forfeited: { color: 'bg-slate-100 text-slate-700', icon: FiX },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading requests...</div>
      </div>
    );
  }

  const sentRequests = requests?.sent || [];
  const receivedRequests = requests?.received || [];

  return (
    <div className="space-y-6">
      <h2 className="h2 text-text-primary">Requests</h2>

      {/* Sent Requests */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-border-light bg-surface-elevation">
          <h3 className="h4 text-text-primary">Sent Requests</h3>
        </div>
        <div className="divide-y divide-border-light">
          {sentRequests.length === 0 ? (
            <div className="px-6 py-8 text-center text-text-secondary">
              No sent requests
            </div>
          ) : (
            sentRequests.map((request) => {
              const receiver = typeof request.receiverId === 'string' ? null : request.receiverId;
              const offeredSkill = typeof request.offeredSkillId === 'string' ? null : request.offeredSkillId;
              const requestedSkill = typeof request.requestedSkillId === 'string' ? null : request.requestedSkillId;

              return (
                <div key={request._id} className="px-6 py-4 hover:bg-surface-elevation transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm font-semibold text-text-primary">
                            To: {receiver?.name || 'Loading...'}
                          </p>
                          <p className="text-sm text-text-secondary mt-0.5">
                            Offer: {offeredSkill?.name || 'Loading...'} | Request: {requestedSkill?.name || 'Loading...'}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <button
                        onClick={() => forfeitMutation.mutate(request._id)}
                        className="ml-4 btn btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        Forfeit
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Received Requests */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-border-light bg-surface-elevation">
          <h3 className="h4 text-text-primary">Received Requests</h3>
        </div>
        <div className="divide-y divide-border-light">
          {receivedRequests.length === 0 ? (
            <div className="px-6 py-8 text-center text-text-secondary">
              No received requests
            </div>
          ) : (
            receivedRequests.map((request) => {
              const sender = typeof request.senderId === 'string' ? null : request.senderId;
              const offeredSkill = typeof request.offeredSkillId === 'string' ? null : request.offeredSkillId;
              const requestedSkill = typeof request.requestedSkillId === 'string' ? null : request.requestedSkillId;

              return (
                <div key={request._id} className="px-6 py-4 hover:bg-surface-elevation transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm font-semibold text-text-primary">
                            From: {sender?.name || 'Loading...'}
                          </p>
                          <p className="text-sm text-text-secondary mt-0.5">
                            Offer: {offeredSkill?.name || 'Loading...'} | Request: {requestedSkill?.name || 'Loading...'}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => acceptMutation.mutate(request._id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 flex items-center space-x-1 transition-all shadow-sm hover:shadow-md"
                        >
                          <FiCheck className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate(request._id)}
                          className="px-4 py-2 text-sm font-medium text-red-500 bg-red-50 rounded-xl hover:bg-red-100 flex items-center space-x-1 transition-all"
                        >
                          <FiX className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;

