<?php

namespace App\GDPR\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProcessDataSubjectRequestRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->user() && auth()->user()->can('process-gdpr-requests');
    }

    public function rules()
    {
        return [
            'status' => 'required|in:verified,in_progress,completed,rejected',
            'processing_notes' => 'nullable|string|max:2000'
        ];
    }

    public function messages()
    {
        return [
            'status.required' => 'Le statut est requis.',
            'status.in' => 'Le statut sélectionné est invalide.',
            'processing_notes.max' => 'Les notes de traitement ne peuvent pas dépasser 2000 caractères.'
        ];
    }
}
