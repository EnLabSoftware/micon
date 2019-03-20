from datetime import datetime
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework import permissions as rest_permissions
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from models import FrontSetting
from django.conf import settings
from utils.file.tools import remove_file
from rest_framework_jwt.settings import api_settings
from payload import site_settings_payload
from utils.shortcuts import get_or_none


@api_view(['GET'])
@permission_classes([rest_permissions.AllowAny,])
def settings_token(request):
    jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
    settings = site_settings_payload(request.user)
    return Response({'token': jwt_encode_handler(settings)})


@api_view(['GET'])
@permission_classes([rest_permissions.AllowAny])
def front_settings(request):
    jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
    slides_setting = get_or_none(FrontSetting, key=settings.SLIDES_SETTING)
    if slides_setting:
        return Response(jwt_encode_handler({'slides_setting': slides_setting.value}))
    else:
        return Response(jwt_encode_handler({'slides_setting': []}))


@api_view(['POST'])
@permission_classes([rest_permissions.IsAdminUser])
def front_add_new_slide(request):
    slides_setting = get_or_none(FrontSetting, key=settings.SLIDES_SETTING)
    files = request.FILES
    #update slide
    if request.POST.get('c_id', ''):
        data = request.POST
        for slide in slides_setting.value:
            if slide['c_id'] == data.get('c_id', ''):
                slide['caption'] = data.get('caption', '')
                path = '%s%s' % (settings.BASE_DIR, slide['image'])
                if files:
                    for file in files.getlist('image'):
                        try:
                            f = default_storage.save("%s/%s/%s" % (settings.MEDIA_ROOT, settings.SLIDES_MEDIA, file.name), ContentFile(file.read()))
                            slide['image'] = str(f).replace(settings.BASE_DIR, '')
                            remove_file(path, True)
                        except Exception as e:
                            return Response({'success': False}, status=status.HTTP_400_BAD_REQUEST)
                slides_setting.save()
                return Response({'success': True}, status=status.HTTP_200_OK)
    #create new slide
    else:
        value = {'c_id': str(datetime.now())}
        value['caption'] = request.data['caption']
        for file in files.getlist('image'):
            try:
                f = default_storage.save("%s/%s/%s" % (settings.MEDIA_ROOT, settings.SLIDES_MEDIA, file.name), ContentFile(file.read()))
                value['image'] = str(f).replace(settings.BASE_DIR, '')
                val = slides_setting.value if slides_setting else []
                val.append(value)
                if slides_setting:
                    slides_setting.update_setting(val)
                else:
                    FrontSetting.objects.create(key=settings.SLIDES_SETTING, value=val)
                return Response({'success': True}, status=status.HTTP_200_OK)
            except Exception as e:
                pass
        return Response({'success': False}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([rest_permissions.IsAdminUser])
def front_delete_slide(request):
    slide_img = request.data['image']
    path = '%s%s' % (settings.BASE_DIR, slide_img)
    slides_setting = get_or_none(FrontSetting, key=settings.SLIDES_SETTING)
    try:
        for slide in slides_setting.value:
            if slide['image'] == slide_img:
                slides_setting.value.remove(slide)
                slides_setting.save()
                remove_file(path, True)
                return Response({'success': True}, status=status.HTTP_200_OK)
    except Exception as e:
        pass
    return Response({'success': False}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([rest_permissions.IsAdminUser])
def site_settings(request):
    title = get_or_none(FrontSetting, key=settings.TITLE_SETTING)
    description = get_or_none(FrontSetting, key=settings.DESCRIPTION_SETTING)
    logo = get_or_none(FrontSetting, key=settings.LOGO_SETTING)
    if request.method == 'POST':
        data = request.POST
        file = request.FILES.get('logo')
        if file:
            try:
                f = default_storage.save("%s/%s/%s" % (settings.MEDIA_ROOT, settings.SITE_LOGO, file.name), ContentFile(file.read()))
                logo_path = str(f).replace(settings.BASE_DIR, '')
                if logo:
                    remove_file('%s/%s' % (settings.BASE_DIR, logo.value), True)
                    logo.update_setting(logo_path)
                else:
                    FrontSetting.objects.create(key=settings.LOGO_SETTING, value=logo_path)
            except Exception as e:
                return Response({'success': False}, status=status.HTTP_400_BAD_REQUEST)
        if title:
            title.update_setting(data.get('title', ''))
        else:
            FrontSetting.objects.create(key=settings.TITLE_SETTING, value=data.get('title', ''))
        if description:
            description.update_setting(data.get('description', ''))
        else:
            FrontSetting.objects.create(key=settings.DESCRIPTION_SETTING, value=data.get('description', ''))

    return Response({
        'title': title.value if title else '',
        'description': description.value if description else '',
        'logo': logo.value if logo else '',
    })
