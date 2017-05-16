%%%-------------------------------------------------------------------
%%% @doc For more info look at https://neil.fraser.name/writing/diff/
%%%
%%% @end
%%%-------------------------------------------------------------------
-module(edeet_diff).

%% API
-export([
    diff/2
]).

-type diff_step() :: {add | del, binary()}.


-define(TERNARY(Cond, TrueVal, FalseVal), (case (Cond) of true -> (TrueVal); false -> (FalseVal) end)).

-spec diff(binary(), binary()) -> list(diff_step()).
diff(Bin, Bin) ->
    [];

diff(<<>>, Bin) ->
    [{ins, Bin}];

diff(Bin, <<>>) ->
    [{del, Bin}];

diff(BinA, BinB) ->
    tdiff:diff_binaries(BinA, BinB).

%%diff(BinA, BinB) ->
%%    Prefix = binary:longest_common_prefix([BinA, BinB]),
%%    Suffix = binary:longest_common_suffix([BinA, BinB]),
%%
%%    BinA2 = binary:part(BinA, {0, Prefix}),
%%    BinA3 = binary:part(BinA2, {Suffix, bit_size(BinA)}),
%%
%%    BinB2 = binary:part(BinB, {0, Prefix}),
%%    BinB3 = binary:part(BinB2, {Suffix, bit_size(BinB)}),
%%
%%    case {BinA3, BinB3} of
%%        {<<>>, BinB3} ->
%%            [{add, BinB3, Prefix}];
%%        {BinA3, <<>>} ->
%%            [{del, BinA3, Prefix}];
%%        _ ->
%%            {Long, Short} = ?TERNARY(bit_size(BinA3) > bit_size(BinB3), {BinA3, BinB3}, {BinB3, BinA3}),
%%            case binary:match(Long, Short) of
%%                nomatch ->
%%                    [];
%%                {Start, Len} ->
%%                    Insert = binary:part(Long, {0, Start}),
%%                    Delete = binary:part(Long, {Len, bit_size(Long)}),
%%
%%                    [{add, Insert, Start},
%%                     {del, Delete, Len}]
%%
%%            end
%%    end.







