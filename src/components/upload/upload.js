const formField = require('../../behaviors/formField');

let _fileId = 0;

Component({
  behaviors: ['wx://form-field', formField],

  options: {
    multipleSlots: true,
  },

  relations: {
    '../form-item/form-item': {
      type: 'ancestor',
    },
  },

  properties: {
    fileList: { type: Array, value: [] },
    mode: { type: String, value: 'grid' },
    accept: { type: String, value: 'image' },
    multiple: { type: Boolean, value: false },
    maxCount: { type: Number, value: 9 },
    maxSize: { type: Number, value: 10 * 1024 * 1024 },
    maxDuration: { type: Number, value: 60 },
    uploadUrl: { type: String, value: '' },
    header: { type: Object, value: {} },
    formData: { type: Object, value: {} },
    fileName: { type: String, value: 'file' },
    sizeType: { type: Array, value: ['original', 'compressed'] },
    sourceType: { type: Array, value: ['album', 'camera'] },
    compressed: { type: Boolean, value: true },
    camera: { type: String, value: 'back' },
    disabled: { type: Boolean, value: false },
    readonly: { type: Boolean, value: false },
    columns: { type: Number, value: 4 },
    size: { type: String, value: '' },
    status: { type: String, value: '' },
    useSlot: { type: Boolean, value: false },
  },

  data: {
    _showAdd: true,
    _fileSizes: [],
    _itemStyle: '',
    _useSlot: false,
  },

  observers: {
    'fileList, maxCount'(fileList, maxCount) {
      const list = fileList || [];
      this.setData({
        _showAdd: maxCount <= 0 || list.length < maxCount,
        _fileSizes: list.map((f) => this._formatSize(f.size)),
      });
      // Sync form value: only completed files
      const doneFiles = list.filter((f) => f.status === 'done' || !f.status);
      this.setData({ value: doneFiles });
    },
    columns(columns) {
      const gaps = columns - 1;
      const style = `width: calc((100% - ${gaps} * var(--spacing-upload-gap)) / ${columns}); height: 0; padding-bottom: calc((100% - ${gaps} * var(--spacing-upload-gap)) / ${columns});`;
      this.setData({ _itemStyle: style });
    },
    useSlot(val) {
      this.setData({ _useSlot: val });
    },
  },

  lifetimes: {
    attached() {
      this._uploadTasks = {};
      const { columns, useSlot } = this.data;
      const gaps = columns - 1;
      const style = `width: calc((100% - ${gaps} * var(--spacing-upload-gap)) / ${columns}); height: 0; padding-bottom: calc((100% - ${gaps} * var(--spacing-upload-gap)) / ${columns});`;
      this.setData({ _itemStyle: style, _useSlot: useSlot });
    },
    detached() {
      this._abortAll();
    },
  },

  methods: {
    // ===== File Selection =====
    handleChoose() {
      if (this.data.readonly || this._isDisabled()) return;

      const { accept } = this.data;
      if (accept === 'file') {
        this._chooseFile();
      } else {
        this._chooseMedia();
      }
    },

    _chooseMedia() {
      const {
        accept,
        multiple,
        maxCount,
        fileList,
        sizeType,
        sourceType,
        compressed,
        camera,
        maxDuration,
      } = this.data;
      const remaining = maxCount > 0 ? maxCount - fileList.length : 9;
      const count = multiple ? remaining : 1;

      const mediaType =
        accept === 'video' ? ['video'] : accept === 'media' ? ['image', 'video'] : ['image'];

      wx.chooseMedia({
        count,
        mediaType,
        sizeType,
        sourceType,
        compressed,
        camera,
        maxDuration,
        success: (res) => {
          const files = res.tempFiles.map((f) => ({
            _id: ++_fileId,
            url: f.tempFilePath,
            name: f.tempFilePath.split('/').pop(),
            size: f.size,
            type: f.fileType || 'image',
            thumb: f.thumbTempFilePath || '',
            status: '',
            progress: 0,
          }));
          this._processFiles(files);
        },
      });
    },

    _chooseFile() {
      const { multiple, maxCount, fileList } = this.data;
      const remaining = maxCount > 0 ? maxCount - fileList.length : 100;
      const count = multiple ? remaining : 1;

      wx.chooseMessageFile({
        count,
        type: 'all',
        success: (res) => {
          const files = res.tempFiles.map((f) => ({
            _id: ++_fileId,
            url: f.path,
            name: f.name,
            size: f.size,
            type: 'file',
            thumb: '',
            status: '',
            progress: 0,
          }));
          this._processFiles(files);
        },
      });
    },

    _processFiles(inFiles) {
      const { maxCount, maxSize, fileList, uploadUrl } = this.data;
      let files = inFiles;

      // Check count limit
      if (maxCount > 0) {
        const remaining = maxCount - fileList.length;
        if (files.length > remaining) {
          this.triggerEvent('overlimit', { files, maxCount });
          files = files.slice(0, remaining);
        }
      }

      // Check size limit
      if (maxSize > 0) {
        const oversized = files.filter((f) => f.size > maxSize);
        if (oversized.length > 0) {
          this.triggerEvent('oversize', { files: oversized });
          files = files.filter((f) => f.size <= maxSize);
        }
      }

      if (files.length === 0) return;

      this.triggerEvent('choose', { files });

      if (uploadUrl) {
        files.forEach((f) => {
          f.status = 'uploading';
        });
      }

      const newList = [...fileList, ...files];
      this._updateFileList(newList);

      if (uploadUrl) {
        files.forEach((f) => {
          this._uploadFile(f._id);
        });
      } else {
        this.triggerEvent('upload', { files });
      }
    },

    // ===== Upload Management =====
    _findFileById(id) {
      const { fileList } = this.data;
      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i]._id === id) return { file: fileList[i], index: i };
      }
      return null;
    },

    _uploadFile(fileId) {
      const { uploadUrl, header, formData, fileName } = this.data;
      const found = this._findFileById(fileId);
      if (!found) return;

      const task = wx.uploadFile({
        url: uploadUrl,
        filePath: found.file.url,
        name: fileName,
        header,
        formData,
        success: (res) => {
          const cur = this._findFileById(fileId);
          if (!cur) return;
          const list = [...this.data.fileList];
          list[cur.index] = { ...list[cur.index], status: 'done', progress: 100 };
          try {
            const data = JSON.parse(res.data);
            if (data.url) list[cur.index].url = data.url;
          } catch (e) {
            // Keep original url
          }
          this._updateFileList(list);
          this.triggerEvent('success', { file: list[cur.index], response: res, fileList: list });
        },
        fail: (err) => {
          const cur = this._findFileById(fileId);
          if (!cur) return;
          const list = [...this.data.fileList];
          list[cur.index] = { ...list[cur.index], status: 'error' };
          this._updateFileList(list);
          this.triggerEvent('error', { file: list[cur.index], error: err, fileList: list });
        },
        complete: () => {
          delete this._uploadTasks[fileId];
        },
      });

      task.onProgressUpdate((res) => {
        const cur = this._findFileById(fileId);
        if (!cur) return;
        const list = [...this.data.fileList];
        list[cur.index] = { ...list[cur.index], progress: res.progress };
        this._updateFileList(list);
        this.triggerEvent('progress', { file: list[cur.index], progress: res.progress });
      });

      this._uploadTasks[fileId] = task;
    },

    _abortAll() {
      if (!this._uploadTasks) return;
      Object.values(this._uploadTasks).forEach((task) => {
        if (task && task.abort) task.abort();
      });
      this._uploadTasks = {};
    },

    // ===== Interactions =====
    handleDelete(e) {
      const { index } = e.currentTarget.dataset;
      const list = [...this.data.fileList];
      const file = list[index];

      // Abort upload if in progress
      if (file._id && this._uploadTasks[file._id]) {
        this._uploadTasks[file._id].abort();
        delete this._uploadTasks[file._id];
      }

      list.splice(index, 1);
      this.triggerEvent('remove', { file, index, fileList: list });
      this._updateFileList(list);
    },

    handlePreview(e) {
      const { index } = e.currentTarget.dataset;
      const { fileList } = this.data;
      const file = fileList[index];
      if (!file || file.status === 'error') return;

      this.triggerEvent('preview', { file, index });

      // Auto preview for images/videos
      if (file.type === 'image' || file.type === 'video') {
        const sources = fileList
          .filter((f) => f.type === 'image' || f.type === 'video')
          .map((f) => ({
            url: f.url,
            type: f.type,
          }));
        const current = sources.findIndex((s) => s.url === file.url);
        wx.previewMedia({
          sources,
          current: current >= 0 ? current : 0,
        });
      }
    },

    handleRetry(e) {
      const { index } = e.currentTarget.dataset;
      const { uploadUrl } = this.data;
      if (!uploadUrl) return;

      const list = [...this.data.fileList];
      const file = list[index];
      if (!file) return;

      list[index] = { ...file, status: 'uploading', progress: 0 };
      this._updateFileList(list);
      this._uploadFile(file._id);
    },

    handleListContentTap(e) {
      const { index } = e.currentTarget.dataset;
      const { fileList } = this.data;
      const file = fileList[index];
      if (!file) return;

      if (file.status === 'error') {
        this.handleRetry(e);
      } else {
        this.handlePreview(e);
      }
    },

    // ===== Public Methods =====
    chooseFile() {
      this.handleChoose();
    },

    upload(file) {
      const { uploadUrl } = this.data;
      if (!uploadUrl || !file._id) return;

      const found = this._findFileById(file._id);
      if (!found) return;

      const list = [...this.data.fileList];
      list[found.index] = { ...list[found.index], status: 'uploading', progress: 0 };
      this._updateFileList(list);
      this._uploadFile(file._id);
    },

    abort(fileId) {
      if (this._uploadTasks[fileId]) {
        this._uploadTasks[fileId].abort();
        delete this._uploadTasks[fileId];

        const found = this._findFileById(fileId);
        if (found) {
          const list = [...this.data.fileList];
          list[found.index] = { ...list[found.index], status: 'error', progress: 0 };
          this._updateFileList(list);
        }
      }
    },

    // ===== Helpers =====
    _updateFileList(list) {
      this.setData({ fileList: list });
      this.triggerEvent('update:fileList', { fileList: list });
      this._notifyChange();
    },

    _formatSize(bytes) {
      if (!bytes) return '';
      if (bytes < 1024) return `${bytes}B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    },
  },
});
