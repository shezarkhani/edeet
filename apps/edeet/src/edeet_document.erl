%%%-------------------------------------------------------------------
%%% @doc
%%%
%%% @end
%%%-------------------------------------------------------------------
-module(edeet_document).

-export([
    init/0,
    edit_document/2,
    get_document/1,
    new/1,
    get_all/0
]).

init() ->
    _ = ets:new(edeet_documents, [public,
                                  named_table,
                                  set,
                                  {read_concurrency, true},
                                  {write_concurrency, true}]).
new(DocName) ->
    DocId = generate_doc_id(DocName),
    true = ets:insert(edeet_documents, {DocId, DocName, <<>>}),

    {DocId, DocName, <<>>}.

get_all() ->
    ets:foldl(
        fun({DocId, DocName, _}, Acc) ->
            DocMap = #{doc_id => DocId,
                       name => DocName},
            [DocMap | Acc]
        end, [], edeet_documents).

get_document(DocId) ->
    case ets:lookup(edeet_documents, DocId) of
        [{DocId, DocName, Bin}] ->
            {DocId, DocName, Bin};
        _ ->
            no_document
    end.

edit_document(DocId, Bin) ->
    ets:update_element(edeet_documents, DocId, {3, Bin}).

-spec generate_doc_id(binary()) -> binary().
generate_doc_id(RawDocName) ->
    DocName = sanitize(RawDocName),
    Random = integer_to_binary(rand:uniform(9000)),

    <<DocName/binary, "_", Random/binary>>.

-spec sanitize(binary()) -> binary().
sanitize(RawDocName) ->
    ReplaceSpaces = re:replace(RawDocName, <<"\s">>, <<"-">>, [global, {return, binary}]),
    ReplaceHtml = re:replace(ReplaceSpaces, <<"<|>">>, <<"">>, [global, {return, binary}]),

    ReplaceHtml.