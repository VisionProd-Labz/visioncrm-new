<?php

namespace App\GDPR\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitDataSubjectRequestRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'request_type' => 'required|in:access,rectification,erasure,portability,restriction,objection',
            'description' => 'nullable|string|max:2000'
        ];

        // Email requis si utilisateur non connecté
        if (!auth()->check()) {
            $rules['email'] = 'required|email';
            $rules['contact_info.name'] = 'required|string|max:255';
        }

        // Règles spécifiques selon le type de demande
        switch ($this->request_type) {
            case 'rectification':
                $rules['corrections'] = 'required|array';
                $rules['corrections.*'] = 'required|string';
                break;
                
            case 'restriction':
                $rules['restrictions'] = 'required|array';
                $rules['restrictions.*'] = 'required|string';
                break;
                
            case 'objection':
                $rules['objections'] = 'required|array';
                $rules['objections.*'] = 'required|in:marketing,profiling,automated_decision';
                break;
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'request_type.required' => 'Le type de demande est requis.',
            'request_type.in' => 'Le type de demande sélectionné est invalide.',
            'email.required' => 'L\'adresse email est requise.',
            'email.email' => 'L\'adresse email doit être valide.',
            'corrections.required' => 'Veuillez spécifier les corrections à apporter.',
            'restrictions.required' => 'Veuillez spécifier les restrictions demandées.',
            'objections.required' => 'Veuillez spécifier vos objections.',
        ];
    }
}
