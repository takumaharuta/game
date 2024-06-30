<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ContentController extends Controller
{
    //
    public function store(Request $request)
    {
        $content = Content::create($request->all());
        return response()->json($content, 201);
    }

    public function update(Request $request, Content $content)
    {
        $content->update($request->all());
        return response()->json($content);
    }

    public function show(Content $content)
    {
        return response()->json($content->load('pages.choices'));
    }
    
    
    /*ここからしたを追加した*/
    public function edit($id = null)
    {
        return Inertia::render('ContentEdit', ['contentId' => $id]);
    }

    public function preview($id)
    {
        return Inertia::render('Preview', ['contentId' => $id]);
    }
}
