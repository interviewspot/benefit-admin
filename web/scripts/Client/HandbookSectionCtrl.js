(function () {
    'use strict';
    angular.module('app.handbook_section', []).controller('HandbookSectionCtrl', [
        '$scope', '$routeParams', 'handbookService', 'clientService', 'sectionService', '$location', '$timeout', 'fetchHandbook', 'config', '$rootScope', function ($scope, $routeParams, handbookService, clientService, sectionService, $location, $timeout, fetchHandbook, config, $rootScope) {
            var orderSections, sectionCompare, translateSection, ungroupSection, _URL_sections, _loadAllParent;
            orderSections = function (items) {
                var i, item, j, treeList, _i, _j, _ref, _ref1;
                treeList = [];
                for (i = _i = 0, _ref = items.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
                    if (!items[i]._links.parent) {
                        items[i].children = [];
                        treeList.push(items[i]);
                    }
                }
                for (j in treeList) {
                    item = treeList[j];
                    for (i = _j = 0, _ref1 = items.length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
                        if (items[i]._links.parent) {
                            if (treeList[j]._links.self.href === items[i]._links.parent.href) {
                                treeList[j].children.push(items[i]);
                            }
                        }
                    }
                }
                for (j in treeList) {
                    item = treeList[j];
                    treeList[j].children = treeList[j].children.sort(sectionCompare);
                }
                treeList.sort(sectionCompare);
                return treeList;
            };
            ungroupSection = function (items) {
                var child, item, j, k, returnList, _ref;
                returnList = [];
                for (j in items) {
                    item = items[j];
                    item.no = parseInt(j) + 1;
                    returnList.push(item);
                    if (item.children.length > 0) {
                        _ref = item.children;
                        for (k in _ref) {
                            child = _ref[k];
                            child.parent_no = item.no;
                            child.no = parseInt(k) + 1;
                            returnList.push(child);
                        }
                    }
                }
                return returnList;
            };
            translateSection = function (item) {
                var newItem;
                newItem = item;
                fetchHandbook.get(item._links.translations.href).then(function (res) {
                    if (res.status !== 200 || typeof res !== 'object') {
                        return;
                    }
                    newItem['translations'] = res.data;
                }, function (error) {
                    console.log(error);
                });
                return newItem;
            };
            sectionCompare = function (a, b) {
                if (a.version < b.version) {
                    return -1;
                }
                if (a.version > b.version) {
                    return 1;
                }
                return 0;
            };
            _URL_sections = {
                list: config.path.baseURL + config.path.sections.replace(':org_id', $scope.clientId).replace(':hand_id', $scope.handbookId)
            };
            $scope.allowShowActionSections = false;
            $scope.loadSections = function (limit, goPage) {
                return fetchHandbook.get(_URL_sections.list + '?search=section.parent{null}1', +'&limit=' + limit, +'&page=' + goPage, +'&sort=section.ordering:asc').then(function (res) {
                    $scope.sections = {};
                    if (res.data._embedded.items.length > 0) {
                        $scope.sections.pages = res.data.pages;
                        $scope.sections.total = res.data.total;
                        $scope.sections.items = [];
                        angular.forEach(res.data._embedded.items, function (item) {
                            item = translateSection(item);
                            item.children = {};
                            item.children.items = [];
                            item.children.total = 0;
                            item.children.show = false;
                            if (item._links.children) {
                                fetchHandbook.get(item._links.children.href, +'?limit=9999', +'&sort=section.ordering:asc').then(function (child) {
                                    if (child.data._embedded.items.length > 0) {
                                        console.log(child.data._embedded.items);
                                        item.children.total = child.data.total;
                                        return angular.forEach(child.data._embedded.items, function (child_item) {
                                            item.children.items.push(translateSection(child_item));
                                            $scope.allowShowActionSections = true;
                                        });
                                    }else{
                                        $scope.allowShowActionSections = true;
                                    }
                                }, function (error) {
                                    return console.log(error);
                                });
                            }else{
                                $scope.allowShowActionSections = true;
                            }
                            return $scope.sections.items.push(item);
                        });
                        return;
                    } else {
                        $scope.sections.pages = 0;
                        $scope.sections.total = 0;
                        return $scope.sections.items = [];
                    }
                }, function (error) {
                    return console.log(error);
                });
            };
            $scope.numPerPageOpt = [3, 5, 10, 20];
            $scope.numPerPage = $scope.numPerPageOpt[2];
            $scope.currentPage = 1;
            $scope.filteredUsers = [];
            $scope.currentPageUsers = [];
            $scope.onNPPChange = function () {
                return $scope.loadSections($scope.numPerPage, $scope.currentPage);
            };
            $scope.gotoPage = function (page) {
                return $scope.loadSections($scope.numPerPage, page);
            };
            $scope.loadSections($scope.numPerPage, $scope.currentPage);
            $scope.parentSection = [];
            _loadAllParent = function () {
                return fetchHandbook.get(_URL_sections.list + '?search=section.parent{null}1&limit=9999').then(function (child) {
                    if (child.data._embedded.items.length > 0) {
                        return angular.forEach(child.data._embedded.items, function (child_item) {
                            return $scope.parentSection.push(translateSection(child_item));
                        });
                    }
                }, function (error) {
                    return console.log(error);
                });
            };
            _loadAllParent();
            $scope.isUpdate = false;
            $scope.isCreateSubSection = true;
            $scope.selectedSec = null;
            $scope.uploadButtonLabel = "Upload Section Images";
            $scope.uploadButtonLabelPdf = "Upload Section Pdfs";
            $scope.urlUpload = "";
            $scope.uploadResponse = "";
            $rootScope.readyToUpload = false;
            $rootScope.readyToUploadPdf = false;
            $scope.readyToAddContent = false;
            $scope.showChildren = function (section) {
                return section.children.show = !section.children.show;
            };

            $rootScope.contents = [];
            $scope.editSection = function (section) {
                $rootScope.contents = [];
                $scope.isUpdate = true;
                section.title = section.translations['en_us'] != undefined ? section.translations['en_us'].title : section.title;
                section.description = section.translations['en_us'] != undefined ? section.translations['en_us'].description : section.description;
                $scope.formSection = section;
                $scope.selectedSec = section.id;
                $scope.readyToAddContent = true;

                if (section._links.parent) {
                    $scope.isCreateSubSection = true;
                    var temp;
                    temp = eval(section._links.parent.href.split('sections/')[1]);
                    $scope.parentSelect = temp;
                    $scope.changedValue(temp);
                } else {
                    $scope.isCreateSubSection = false;
                    $scope.parentSelect = null;
                }
                //get content
                fetchHandbook.get($scope.formSection._links.contents.href + "?sort=content.ordering:asc").then(function (contents) {
                    angular.forEach(contents.data._embedded.items, function (content, key) {
                        content.url = "";
                        content.image_id = "";
                        content.pdf_binary = "";
                        content.pdf_id = "";
                        content.pdf_name = "";
                        content.isShow = false;
                        $rootScope.contents.push(content);
                    });

                    angular.forEach($rootScope.contents, function (content, key) {
                        if (content._links != undefined) {
                            fetchHandbook.get(content._links.translations.href).then(function (translations) {
                                content.html_text = translations.data.en_us.htmlText;
                                if (content._links.image_url != undefined) {
                                    fetchHandbook.get(content._links.image_url.href + "?locale=en_us").then(function (image) {
                                        content.url = image.data.image_url;
                                        if (content.html_text == 'none') {
                                            fetchHandbook.get(content._links.image.href + "?locale=en_us").then(function (image) {
                                                content.image_id = image.data.id;
                                            }, function (error) {
                                                return console.log(error);
                                            });
                                        }
                                        if (content.html_text == 'none_pdf') {
                                            fetchHandbook.get(content._links.pdf.href + "?locale=en_us").then(function (pdf) {
                                                content.pdf_id = pdf.data.id;
                                                content.pdf_binary = content._links.pdf_binary.href;
                                                content.pdf_name = pdf.data.name;
                                            }, function (error) {
                                                return console.log(error);
                                            });
                                        }
                                    }, function (error) {
                                        return console.log(error);
                                    });
                                }
                            }, function (error) {
                                return console.log(error);
                            });


                        }
                    });


                }, function (error) {
                    return console.log(error);
                });



                $scope.isUpdate = true;
                $rootScope.readyToUpload = false;
                $rootScope.readyToUploadPdf = false;
                return;
            };
            $scope.contentImage = {};
            $scope.contentImageLink = '';
            $scope.addNewImage = function () {
                var content;
                content = {
                    "content": {
                        "title": "Image of " + $scope.formSection.title,
                        "image_id": "",
                        "html_text": "none",
                        "enabled": "1",
                        "section": $scope.formSection.id,
                        "locale": "en_us",
                        "ordering": $rootScope.contents.length,
                    }
                };
                if ($scope.formSection._links.contents) {
                    return fetchHandbook.post($scope.formSection._links.contents.href, content).then(function (res) {
                        if (typeof res === 'object' && res.status === 201) {
                            return fetchHandbook.get(config.path.baseURL + res.headers().location).then(function (content) {
                                if (content.data._links.image) {
                                    $scope.urlUpload = content.data._links.image.href + "?locale=en_us";
                                    $scope.contentImage = content.data;
                                    $scope.contentImageLink = content.data._links.image_url.href + "?locale=en_us";
                                    console.log(content);
                                    return $rootScope.readyToUpload = true;
                                }
                            }, function (error) {
                                return console.log(error);
                            });
                        }
                    }, function (error) {
                        return console.log(error);
                    });
                }
            };
            $scope.contentPdf = {};
            $scope.contentPdfLink = '';
            $scope.addNewPdf = function () {
                var content;
                content = {
                    "content": {
                        "title": "Image of " + $scope.formSection.title,
                        "pdf_id": "",
                        "html_text": "none_pdf",
                        "enabled": "1",
                        "section": $scope.formSection.id,
                        "locale": "en_us",
                        "ordering": $rootScope.contents.length,
                    }
                };
                if ($scope.formSection._links.contents) {
                    return fetchHandbook.post($scope.formSection._links.contents.href, content).then(function (res) {
                        if (typeof res === 'object' && res.status === 201) {
                            return fetchHandbook.get(config.path.baseURL + res.headers().location).then(function (content) {
                                if (content.data._links.pdf) {
                                    $scope.urlUpload = content.data._links.pdf.href + "?locale=en_us";
                                    $scope.contentPdf = content.data;
                                    $scope.contentPdfLink = content.data._links.pdf.href + "?locale=en_us";;
                                    $scope.contentImage = null;
                                    $scope.contentImageLink = null;
                                    console.log(content);
                                    return $rootScope.readyToUploadPdf = true;
                                }
                            }, function (error) {
                                return console.log(error);
                            });
                        }
                    }, function (error) {
                        return console.log(error);
                    });
                }
            };
            $scope.changedValue = function (id) {
                return $scope.parentSelect = id;
            };
            $scope.createSubSction = function (isSub) {
                $scope.selectedSec = null;
                $scope.isUpdate = false;
                $scope.isCreateSubSection = isSub;
                $scope.formSection = {
                    description: '',
                    title: '',
                    ordering: '',
                    status: ''
                };
                return $scope.parentSelect = null;
            };
            $scope.formSection = {
                description: '',
                title: '',
                ordering: '',
                status: ''
            };
            $scope.deleteSection = function (section) {
                var r, title;
                if (section.translations['en_us'] != undefined) {
                    title = section.translations['en_us'].title;
                } else {
                    title = section.title;
                }
                r = confirm("Do you want to delete this section: \"" + title + "\"?");
                if (r === true) {
                    return sectionService["delete"]({
                        org_id: $scope.clientId,
                        hand_id: $scope.handbookId,
                        section_id: section.id
                    }, function (res) {
                        $scope.isUpdate = false;
                        $scope.formSection = {};
                        return $scope.loadSections($scope.numPerPage, $scope.currentPage);
                    });
                }
            };
            $scope.parentSelect = null;
            $scope.submitSection = function () {
                var sectionItem;
                angular.forEach($scope.frm_section.$error.required, function (field) {
                    return field.$dirty = true;
                });
                if ($scope.frm_section.$error.required) {
                    return false;
                }
                if($scope.formSection.description == undefined)
                {
                    $scope.formSection.description = ' ';
                }
                sectionItem = {
                    section: {
                        description: $scope.formSection.description,
                        title: $scope.formSection.title,
                        ordering: $scope.formSection.ordering,
                        handbook: $scope.handbookId,
                        parent: $scope.parentSelect,
                        locale: 'en_us',
                        enabled: $scope.formSection.enabled
                    }
                };
                console.log(sectionItem);
                if ($scope.isUpdate === true) {
                    return sectionService.update({
                        org_id: $scope.clientId,
                        hand_id: $scope.handbookId,
                        section_id: $scope.formSection.id
                    }, sectionItem, function (res) {
                        $scope.loadSections($scope.numPerPage, $scope.currentPage);
                        $scope.sectionUpdated = 'Update Success';
                        return $timeout(function () {
                            $scope.sectionUpdated = null;
                            if ($scope.parentSelect) {
                                $scope.parentSection = [];
                                return _loadAllParent();
                            }
                        }, 1000);
                    }, function (error) {
                        return $scope.sectionUpdated = error.status + ': Error, refresh & try again !';
                    });
                } else {
                    if ($scope.isCreateSubSection === true && $scope.isUpdate === false) {
                        sectionService.saveChild({
                            org_id: $scope.clientId,
                            hand_id: $scope.handbookId
                        }, sectionItem, function (res) {
                            $scope.loadSections($scope.numPerPage, $scope.currentPage);
                            $scope.sectionUpdated = 'Submit Success';
                            return $timeout(function () {
                                $scope.sectionUpdated = null;
                                $scope.parentSection = [];
                                return _loadAllParent();
                            }, 1000);
                        }, function (error) {
                            return $scope.sectionUpdated = error.status + ': Error, refresh & try again !';
                        });
                    }
                    if ($scope.isCreateSubSection === false && $scope.isUpdate === false) {
                        return sectionService.save({
                            org_id: $scope.clientId,
                            hand_id: $scope.handbookId
                        }, sectionItem, function (res) {
                            $scope.loadSections($scope.numPerPage, $scope.currentPage);
                            $scope.sectionUpdated = 'Submit Success';
                            return $timeout(function () {
                                return $scope.sectionUpdated = null;
                            }, 1000);
                        }, function (error) {
                            return $scope.sectionUpdated = error.status + ': Error, refresh & try again !';
                        });
                    }
                }
            };

            $scope.content = {
                "title": "Image of " + $scope.formSection.title,
                "image_id": "",
                "html_text": '',
                "enabled": "1",
                "section": $scope.formSection.id,
                "locale": "en_us",
                "isShow": true
            };
            $scope.submitContent = function (content, index) {
                content = {
                    "content": content
                };
                if ($scope.formSection._links.contents) {
                    if (content.content.id != undefined) {
                        //put
                        var urlEdit = content.content._links.self.href;
                        content.content.image_id = "";
                        content.content.section = $scope.formSection.id;
                        content.content.locale = "en_us";
                        delete content.content._links;
                        delete content.content.id;
                        delete content.content.url;
                        delete content.content.isShow;
                        delete content.content.pdf_binary;
                        delete content.content.pdf_name;
                        return fetchHandbook.put(urlEdit, content).then(function (res) {
                            if (res.status === 204) {
                                $rootScope.contents[index].isShow = false;
                                console.log(content);
                                return console.log('ok men');
                            }
                        }, function (error) {
                            return console.log(error);
                        });
                    } else {
                        //post
                        delete content.content.isShow;

                        return fetchHandbook.post($scope.formSection._links.contents.href, content).then(function (res) {
                            if (typeof res === 'object' && res.status === 201) {
                                return fetchHandbook.get(config.path.baseURL + res.headers().location).then(function (content) {
                                    $rootScope.contents[index]._links = content.data._links;
                                    $rootScope.contents[index].id = content.data.id;
                                    $rootScope.contents[index].isShow = false;
                                    console.log(content);
                                    return console.log(content);
                                }, function (error) {
                                    return console.log(error);
                                });
                            }
                        }, function (error) {
                            return console.log(error);
                        });
                    }
                }
            };
            $scope.deleteContent = function (content, index) {
                //delete
                if (content._links != undefined) {
                    var url = content._links.self.href + "?locale=en_us";
                    return fetchHandbook.delete(url).then(function (res) {
                        if (res.status === 204) {
                            $rootScope.contents.splice(index, 1);
                            return console.log(res);

                        }
                    }, function (error) {
                        return console.log(error);
                    });
                } else {
                    $rootScope.contents.splice(index, 1);
                }
            }
            $scope.addContentLink = function () {
                var newContent;
                $scope.content.title = 'link';
                newContent = $scope.content;
                newContent.ordering = $rootScope.contents.length;
                var order = $scope.contents.length;
                $rootScope.contents.push(newContent);
                return $scope.content = {
                    "title": "link",
                    "image_id": "",
                    "html_text": '',
                    "enabled": "1",
                    "section": $scope.formSection.id,
                    "locale": "en_us",
                    "isShow": true
                };
            };
            $scope.addContent = function () {
                var newContent;
                $scope.content.title = 'content';
                newContent = $scope.content;
                newContent.ordering = $rootScope.contents.length;
                var order = $scope.contents.length;
                $rootScope.contents.push(newContent);
                return $scope.content = {
                    "title": "content",
                    "image_id": "",
                    "html_text": '',
                    "enabled": "1",
                    "section": $scope.formSection.id,
                    "locale": "en_us",
                    "isShow": true
                };
            };
            $scope.editContent = function (index) {
                $rootScope.contents[index].isShow = true;
            }; 
            $scope.closeEditContent = function (index) {
                $rootScope.contents[index].isShow = false;
            };


            $scope.$watch('contents', function (contents) {
                angular.forEach(contents, function (content, key) {
                    content.ordering = key;
                });
                console.log($rootScope.contents);
                return;
            }, true);

            $scope.updateOrderingContent = function () {
                angular.forEach($rootScope.contents, function (content, key) {
                    //put
                    if (content.id != undefined) {
                        var urlEdit = content._links.self.href;
                        content.locale = "en_us";
                        content.section = $scope.formSection.id;
                        var tmpName = content.pdf_name;
                        delete content._links;
                        delete content.id;
                        delete content.url;
                        delete content.isShow;
                        delete content.pdf_binary;
                        delete content.pdf_name;
                        content = {
                            "content": content
                        };
                        return fetchHandbook.put(urlEdit, content).then(function (res) {
                            if (res.status === 204) {
                                console.log(content);
                                $rootScope.contents[key].pdf_name = tmpName;
                                return console.log('ok men');
                            }
                        }, function (error) {
                            return console.log(error);
                        });
                    }
                });
            }
            $scope.enabledSort = true;
            $scope.enableSortContent = function () {
                if($scope.enabledSort){
                    $scope.enabledSort = false
                }else{
                    $scope.enabledSort = true;
                }
            }


        }
    ]);

}).call(this);
