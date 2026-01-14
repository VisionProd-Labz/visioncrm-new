<?php

namespace App\Mail\GDPR;

use App\GDPR\Models\DataSubjectRequest;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RequestVerificationMail extends Mailable
{
    use SerializesModels;

    public $request;
    public $verificationToken;

    public function __construct(DataSubjectRequest $request, string $verificationToken)
    {
        $this->request = $request;
        $this->verificationToken = $verificationToken;
    }

    public function build()
    {
        return $this->subject('Vérification de votre demande RGPD')
                    ->view('emails.gdpr.request-verification')
                    ->with([
                        'request' => $this->request,
                        'verificationUrl' => route('gdpr.requests.verify', $this->verificationToken),
                        'requestType' => $this->request->getRequestTypeLabel()
                    ]);
    }
}
