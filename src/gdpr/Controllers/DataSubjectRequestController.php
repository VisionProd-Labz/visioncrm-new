<?php

namespace App\GDPR\Controllers;

use App\Http\Controllers\Controller;
use App\GDPR\Models\DataSubjectRequest;
use App\GDPR\Services\DataSubjectRequestService;
use App\GDPR\Requests\SubmitDataSubjectRequestRequest;
use App\GDPR\Requests\ProcessDataSubjectRequestRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DataSubjectRequestController extends Controller
{
    protected $requestService;

    public function __construct(DataSubjectRequestService $requestService)
    {
        $this->requestService = $requestService;
    }

    public function index(Request $request)
    {
        $query = DataSubjectRequest::with(['user', 'processor']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('request_type', $request->type);
        }

        if ($request->has('search')) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $requests = $query->orderBy('submitted_at', 'desc')
                         ->paginate(20);

        return view('gdpr.requests.index', compact('requests'));
    }

    public function show(DataSubjectRequest $request)
    {
        $request->load(['user', 'processor']);
        return view('gdpr.requests.show', compact('request'));
    }

    public function create()
    {
        return view('gdpr.requests.create');
    }

    public function store(SubmitDataSubjectRequestRequest $request)
    {
        try {
            $dataSubjectRequest = $this->requestService->submitRequest(
                $request->validated(),
                Auth::user()
            );

            return redirect()
                ->route('gdpr.requests.success')
                ->with('success', 'Votre demande a été soumise avec succès. Un email de vérification vous a été envoyé.');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Une erreur est survenue lors de la soumission de votre demande.');
        }
    }

    public function verify($token)
    {
        try {
            $request = $this->requestService->verifyRequest($token);
            
            return redirect()
                ->route('gdpr.requests.verified')
                ->with('success', 'Votre demande a été vérifiée et sera traitée dans les plus brefs délais.');
        } catch (\Exception $e) {
            return redirect()
                ->route('gdpr.requests.create')
                ->with('error', $e->getMessage());
        }
    }

    public function process(DataSubjectRequest $request)
    {
        return view('gdpr.requests.process', compact('request'));
    }

    public function updateStatus(ProcessDataSubjectRequestRequest $request, DataSubjectRequest $dataSubjectRequest)
    {
        try {
            $this->requestService->processRequest(
                $dataSubjectRequest,
                $request->validated(),
                Auth::user()
            );

            return redirect()
                ->route('gdpr.requests.show', $dataSubjectRequest)
                ->with('success', 'Le statut de la demande a été mis à jour.');
        } catch (\Exception $e) {
            return back()
                ->with('error', 'Une erreur est survenue lors de la mise à jour.');
        }
    }

    public function export(DataSubjectRequest $request)
    {
        if ($request->request_type !== 'access' || $request->status !== 'completed') {
            abort(403, 'Export non autorisé pour cette demande.');
        }

        return $this->requestService->exportUserData($request);
    }

    public function myRequests()
    {
        $requests = DataSubjectRequest::where('user_id', Auth::id())
                                    ->orderBy('submitted_at', 'desc')
                                    ->paginate(10);

        return view('gdpr.requests.my-requests', compact('requests'));
    }

    public function success()
    {
        return view('gdpr.requests.success');
    }

    public function verified()
    {
        return view('gdpr.requests.verified');
    }
}
