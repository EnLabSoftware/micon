from itertools import combinations, chain


def get_or_none(cls, **filter):
    try:
        return cls.objects.get(**filter)
    except:
        return None


def powerset(iterable):
    "powerset([1,2,3]) --> () (1,) (2,) (3,) (1,2) (1,3) (2,3) (1,2,3)"
    s = list(iterable)
    powerset_ = list(chain.from_iterable(combinations(s, r) for r in range(len(s)+1)))
    powerset_.remove(tuple())
    return powerset_


