<?php

namespace App\Mail\GDPR;

use App\GDPR\Models\DataSubjectRequest;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RequestProcessedMail extends Mailable
{
    use SerializesModels;

    public $request;

    public function __construct(DataSubjectRequest $request)
    {
        $this->request = $request;
    }

    public function build()
    {
        $subject = $this->request->status === 'completed' 
            ? 'Votre demande RGPD a été traitée'
            : 'Mise à jour de votre demande RGPD';

        return $this->subject($subject)
                    ->view('emails.gdpr.request-processed')
                    ->with([
                        'request' => $this->request,
                        'requestType' => $this->request->getRequestTypeLabel(),
                        'status' => $this->request->getStatusLabel()
                    ]);
    }
}
